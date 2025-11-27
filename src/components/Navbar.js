// client/src/components/Navbar.js - FULLY FIXED VERSION 🎨
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import NavbarGamification from './gamification/NavbarGamification';
import { useGamification } from '../context/GamificationContext';

import {
    Home, TrendingUp, PieChart, Eye, Filter, MapPin, Newspaper, BookOpen, Brain, MessageSquare,
    DollarSign, LogOut, User, Menu, X, ChevronDown, Zap, Users,
    Settings, Bell, CheckCircle, AlertCircle, TrendingUp as TrendingUpIcon,
    DollarSign as DollarIcon, Clock, ArrowUpRight, ArrowDownRight, Trophy, Twitter,
    Briefcase, BarChart3, Activity, Sparkles, Globe, Calculator, TrendingDown, MessageCircle, Award, Waves
} from 'lucide-react';
import nexusSignalLogo from '../assets/nexus-signal-logo.png';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideDown = keyframes`
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shake = keyframes`
    0%, 100% { transform: rotate(0deg); }
    10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
    20%, 40%, 60%, 80% { transform: rotate(10deg); }
`;

// ============ STYLED COMPONENTS (FIXED COLORS!) ============
const NavContainer = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(10, 14, 39, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 173, 239, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    animation: ${fadeIn} 0.5s ease-out;
`;

// ✅ FIXED: Nav starts from left edge, no centering
const NavInner = styled.div`
    width: 100%;
    padding: 0 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    height: 70px;

    @media (max-width: 768px) {
        padding: 0 1rem;
        justify-content: space-between;
    }
`;

// ============ LOGO (FIXED VISIBILITY!) ============
const Logo = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: 900;
    position: relative;
    transition: all 0.3s ease;
    flex-shrink: 0;
    margin-right: 1rem;

    &:hover {
        transform: translateY(-2px) scale(1.02);
        filter: brightness(1.2);
    }
`;

const LogoIcon = styled.div`
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;

    filter: drop-shadow(0 0 5px rgba(0, 173, 239, 0.7))
            drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))
            drop-shadow(0 0 15px rgba(0, 173, 239, 0.3));

    &::before {
        content: '';
        position: absolute;
        inset: 0px;
        background: radial-gradient(circle, 
            rgba(0, 173, 239, 0.2) 0%, 
            rgba(0, 255, 136, 0.1) 40%, 
            transparent 70%);
        border-radius: 50%;
        z-index: -1;
        opacity: 0.5;
        animation: ${pulse} 3s ease-in-out infinite;
    }

    &:hover {
        filter: drop-shadow(0 0 10px rgba(0, 173, 239, 0.9))
                drop-shadow(0 0 20px rgba(0, 255, 136, 0.7))
                drop-shadow(0 0 35px rgba(0, 173, 239, 0.5));
        transform: translateY(-3px) scale(1.08);
    }

    @media (max-width: 768px) {
        width: 40px;
        height: 40px;
    }
`;

const LogoImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
`;

// ✅ FIXED: Bright visible gradient for "Nexus Signal" text
const LogoText = styled.span`
    letter-spacing: 1px;
    font-size: 1rem;
    font-weight: 800;
    
    background: linear-gradient(135deg, 
        #00adef 0%,
        #00ff88 50%,
        #00adef 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    filter: drop-shadow(0 0 10px rgba(0, 173, 239, 0.5));
    
    transition: all 0.3s ease;

    &:hover {
        filter: drop-shadow(0 0 15px rgba(0, 173, 239, 0.7));
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

// ============ NAV LINKS ============
const NavLinks = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;

    @media (max-width: 1024px) {
        display: none;
    }
`;

const NavItem = styled.div`
    position: relative;
`;

// ✅ FIXED: Cyan active color instead of purple
const NavLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.75rem;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85rem;
    border-radius: 8px;
    position: relative;
    transition: all 0.3s ease;
    background: ${props => props.$active ? 'rgba(0, 173, 239, 0.15)' : 'transparent'};
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 239, 0.3)' : 'transparent'};
    white-space: nowrap;

    &:hover {
        color: #00adef;
        background: rgba(0, 173, 239, 0.1);
        border-color: rgba(0, 173, 239, 0.3);
        transform: translateY(-2px);
    }
`;

// ✅ FIXED: Cyan active color instead of purple
const DropdownTrigger = styled.button`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.75rem;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    background: ${props => props.$active ? 'rgba(0, 173, 239, 0.15)' : 'transparent'};
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 239, 0.3)' : 'transparent'};
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover {
        color: #00adef;
        background: rgba(0, 173, 239, 0.1);
        border-color: rgba(0, 173, 239, 0.3);
        transform: translateY(-2px);
    }

    svg:last-child {
        transition: transform 0.3s ease;
        transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0)'};
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 173, 239, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    min-width: 220px;
    overflow: hidden;
    animation: ${slideDown} 0.3s ease-out;
    z-index: 1001;
`;

const DropdownItem = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    color: ${props => props.$active ? '#00adef' : '#f8fafc'};
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(0, 173, 239, 0.1);
    background: ${props => props.$active ? 'rgba(0, 173, 239, 0.15)' : 'transparent'};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: rgba(0, 173, 239, 0.15);
        color: #00adef;
        padding-left: 1.5rem;
    }
`;

// ============ USER SECTION ============
// ✅ FIXED: Added margin-left: auto to push user section to the right
const UserSection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;
    flex-shrink: 0;

    @media (max-width: 768px) {
        gap: 0.5rem;
        margin-left: 0;
    }
`;

const NotificationButton = styled.button`
    position: relative;
    background: rgba(0, 173, 239, 0.1);
    border: 1px solid rgba(0, 173, 239, 0.3);
    color: #00adef;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 239, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 173, 239, 0.3);
        
        svg {
            animation: ${shake} 0.5s ease-in-out;
        }
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

const NotificationBadge = styled.span`
    position: absolute;
    top: -4px;
    right: -4px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(10, 14, 39, 0.95);
    animation: ${pulse} 2s ease-in-out infinite;
`;

// ============ NOTIFICATION PANEL ============
const NotificationPanel = styled.div`
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 173, 239, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    width: 400px;
    max-height: 500px;
    overflow: hidden;
    animation: ${slideDown} 0.3s ease-out;
    z-index: 1001;
    display: flex;
    flex-direction: column;

    @media (max-width: 768px) {
        width: 90vw;
        right: -50px;
    }
`;

const NotificationHeader = styled.div`
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(0, 173, 239, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const NotificationTitle = styled.h3`
    color: #00adef;
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
`;

const MarkAllRead = styled.button`
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: #00adef;
    }
`;

const NotificationList = styled.div`
    overflow-y: auto;
    max-height: 400px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 239, 0.05);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 239, 0.3);
        border-radius: 3px;

        &:hover {
            background: rgba(0, 173, 239, 0.5);
        }
    }
`;

const NotificationItem = styled.div`
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(0, 173, 239, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.$unread ? 'rgba(0, 173, 239, 0.05)' : 'transparent'};
    position: relative;

    &:hover {
        background: rgba(0, 173, 239, 0.1);
    }

    &:last-child {
        border-bottom: none;
    }
`;

const NotificationItemHeader = styled.div`
    display: flex;
    align-items: start;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
`;

const NotificationIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${props => {
        if (props.$type === 'success') return 'rgba(16, 185, 129, 0.2)';
        if (props.$type === 'warning') return 'rgba(245, 158, 11, 0.2)';
        if (props.$type === 'error') return 'rgba(239, 68, 68, 0.2)';
        return 'rgba(0, 173, 239, 0.2)';
    }};
    color: ${props => {
        if (props.$type === 'success') return '#10b981';
        if (props.$type === 'warning') return '#f59e0b';
        if (props.$type === 'error') return '#ef4444';
        return '#00adef';
    }};
`;

const NotificationContent = styled.div`
    flex: 1;
`;

const NotificationItemTitle = styled.div`
    color: #f8fafc;
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
`;

const NotificationItemText = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    line-height: 1.4;
`;

const NotificationTime = styled.div`
    color: #64748b;
    font-size: 0.75rem;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const UnreadDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00adef;
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const EmptyState = styled.div`
    padding: 3rem 2rem;
    text-align: center;
    color: #64748b;
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    background: rgba(0, 173, 239, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #00adef;
`;

const EmptyStateText = styled.div`
    font-size: 0.95rem;
    color: #94a3b8;
`;

const UserMenuButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: linear-gradient(135deg, rgba(0, 173, 239, 0.15) 0%, rgba(0, 173, 239, 0.05) 100%);
    border: 1px solid rgba(0, 173, 239, 0.3);
    border-radius: 10px;
    color: #f8fafc;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 239, 0.25) 0%, rgba(0, 173, 239, 0.1) 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 173, 239, 0.3);
    }

    @media (max-width: 768px) {
        padding: 0.4rem;
        gap: 0;
    }
`;

const UserAvatar = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$src ? 
        `url(${props.$src}) center/cover` : 
        'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: ${props => props.$src ? '0' : '0.85rem'};
    color: white;
    box-shadow: 0 2px 10px rgba(0, 173, 239, 0.4);
    position: relative;
    overflow: hidden;
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
`;

const AvatarInitials = styled.div`
    position: relative;
    z-index: 1;
`;

const UserName = styled.span`
    @media (max-width: 768px) {
        display: none;
    }
`;

const DropdownIcon = styled(ChevronDown)`
    transition: transform 0.3s ease;
    transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0)'};

    @media (max-width: 768px) {
        display: none;
    }
`;

// ============ USER DROPDOWN MENU ============
const UserDropdownMenu = styled.div`
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 173, 239, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    min-width: 220px;
    overflow: hidden;
    animation: ${slideDown} 0.3s ease-out;
    z-index: 1001;
`;

const UserDropdownItem = styled.button`
    width: 100%;
    padding: 0.75rem 1.25rem;
    background: transparent;
    border: none;
    color: #f8fafc;
    text-align: left;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(0, 173, 239, 0.1);

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: rgba(0, 173, 239, 0.15);
        color: #00adef;
        padding-left: 1.5rem;
    }

    &.danger {
        color: #ef4444;

        &:hover {
            background: rgba(239, 68, 68, 0.15);
        }
    }
`;

// ============ MOBILE MENU ============
const MobileMenuButton = styled.button`
    display: none;
    background: rgba(0, 173, 239, 0.1);
    border: 1px solid rgba(0, 173, 239, 0.3);
    color: #00adef;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 239, 0.2);
        transform: translateY(-2px);
    }

    @media (max-width: 1024px) {
        display: flex;
    }
`;

const MobileMenu = styled.div`
    position: fixed;
    top: 70px;
    left: 0;
    right: 0;
    bottom: 0;
    min-height: calc(100vh - 70px);
    background: #0a0e27;
    backdrop-filter: blur(20px);
    z-index: 9999;
    animation: ${fadeIn} 0.3s ease-out;
    overflow-y: auto;
    display: ${props => props.$open ? 'block' : 'none'};
    border-top: 2px solid rgba(0, 173, 239, 0.3);

    @media (min-width: 1025px) {
        display: none !important;
    }
`;

const MobileNavLinks = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 100vh;
    background: #0a0e27;
`;

const MobileNavCategory = styled.div`
    margin-bottom: 0.5rem;
`;

const MobileCategoryTitle = styled.div`
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 0.5rem 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const MobileNavLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    color: ${props => props.$active ? '#00adef' : '#f8fafc'};
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 12px;
    background: ${props => props.$active ? 'rgba(0, 173, 239, 0.15)' : 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 239, 0.3)' : 'rgba(100, 116, 139, 0.3)'};
    transition: all 0.2s ease;
    min-height: 56px;

    &:hover {
        color: #00adef;
        background: rgba(0, 173, 239, 0.1);
        border-color: rgba(0, 173, 239, 0.3);
        transform: translateX(5px);
    }
`;

const Divider = styled.div`
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 173, 239, 0.3), transparent);
    margin: 1rem 0;
`;

// ============ COMPONENT ============
const Navbar = () => {
    const { user, logout, isAuthenticated, api } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { vault } = useGamification();
    
    const [dropdowns, setDropdowns] = useState({
        trading: false,
        analysis: false,
        community: false,
        ai: false,
        market: false,
        vault: false,
    });
    
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // ✅ FIXED: Added missing useState for notifications
    const [notifications, setNotifications] = useState([]);

    // Helper functions
    const getIconForType = (type) => {
        switch (type) {
            case 'price_alert': return TrendingUpIcon;
            case 'prediction_expiry': return Clock;
            case 'portfolio_milestone': return Trophy;
            default: return Bell;
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffInMinutes = Math.floor((now - notifDate) / 60000);
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    // ✅ FIXED: Single, complete fetchNotifications function
    const fetchNotifications = async () => {
        // Don't fetch if not authenticated
        if (!isAuthenticated || !user) return;
        
        try {
            const response = await api.get('/notifications');
            
            // Map backend notifications to your format
            const mappedNotifications = (response.data.notifications || response.data || []).map(notif => ({
                id: notif._id,
                type: notif.type === 'price_alert' ? 'success' : 
                      notif.type === 'prediction_expiry' ? 'warning' : 'info',
                title: notif.title,
                text: notif.message,
                time: getTimeAgo(notif.createdAt),
                unread: !notif.read,
                icon: getIconForType(notif.type)
            }));
            
            setNotifications(mappedNotifications);
        } catch (error) {
            // Silently fail for 401 errors (user not logged in)
            if (error.response?.status !== 401) {
                console.error('Failed to fetch notifications:', error);
            }
        }
    };

    // ✅ FIXED: useEffect with proper dependencies
    useEffect(() => {
        if (!isAuthenticated || !user) return;
        
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    const unreadCount = notifications.filter(n => n.unread).length;

    // Navigation structure
    const navStructure = {
        single: [
            { path: '/dashboard', label: 'Dashboard', icon: Home },
            { path: '/vault', label: 'The Vault', icon: DollarSign }, 
        ],
        trading: [
            { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
            { path: '/watchlist', label: 'Watchlist', icon: Eye },
            { path: '/paper-trading', label: 'Paper Trading', icon: TrendingUp },
        ],
        analysis: [
            { path: '/screener', label: 'Screener', icon: Filter },
            { path: '/heatmap', label: 'Heatmap', icon: MapPin },
            { path: '/sentiment', label: 'Sentiment', icon: Activity },
            { path: '/compare', label: 'Stock Comparison', icon: BarChart3 },
            { path: '/whale-alerts', label: 'Whale Alerts', icon: Waves },
        ],
        community: [
            { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
            { path: '/discover', label: 'Discover', icon: Sparkles },
            { path: '/journal', label: 'Journal', icon: BookOpen },
        ],
        ai: [
            { path: '/predict', label: 'AI Predict', icon: Brain },
            { path: '/chat', label: 'AI Chat', icon: MessageSquare },
        ],
        market: [
            { path: '/news', label: 'News', icon: Newspaper },
            { path: '/calculators', label: 'Calculators', icon: Calculator },
        ],
        bottom: [
            { path: '/pricing', label: 'Pricing', icon: DollarSign },
        ],
    };

    // ✅ FIXED: Close other dropdowns when opening a new one
    const handleDropdownToggle = (dropdown) => {
        setDropdowns({
            trading: false,
            analysis: false,
            community: false,
            ai: false,
            market: false,
            vault: false,
            [dropdown]: !dropdowns[dropdown]
        });
        // Also close user dropdown and notifications when opening nav dropdown
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
    };

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
    };

    const handleNotificationClick = async (notification) => {
    try {
        await api.put(`/notifications/${notification.id}/read`);
        
        // Update local state
        setNotifications(notifications.map(n => 
            n.id === notification.id ? { ...n, unread: false } : n
        ));

        // Navigate based on notification type
        if (notification.type === 'success' || notification.type === 'price_alert') {
            navigate('/watchlist');
        } else if (notification.type === 'warning' || notification.type === 'prediction_expiry') {
            navigate('/predict');
        } else if (notification.type === 'achievement') {
            navigate('/achievements/browse');
        } else if (notification.type === 'level_up') {
            navigate('/profile');
        } else if (notification.type === 'follow') {
            navigate('/profile');
        } else if (notification.type === 'portfolio_milestone') {
            navigate('/portfolio');
        } else {
            // Default: go to dashboard
            navigate('/dashboard');
        }

        setNotificationsOpen(false);
    } catch (error) {
        console.error('Failed to mark as read:', error);
        // Still navigate and close even if marking as read fails
        setNotificationsOpen(false);
    }
};

const handleMarkAllRead = async () => {
    try {
        await api.post('/notifications/mark-all-read');
        
        setNotifications(notifications.map(n => ({ ...n, unread: false })));
    } catch (error) {
        console.error('Failed to mark all as read:', error);
    }
};
    const getUserInitials = () => {
        if (!user?.name) return 'U';
        return user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const isPathActive = (paths) => {
        return paths.some(item => location.pathname === item.path);
    };

    useEffect(() => {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
        setDropdowns({
            trading: false,
            analysis: false,
            community: false,
            ai: false,
            market: false,
            vault: false,
        });
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('[data-notification-panel]') && !e.target.closest('[data-notification-button]')) {
                setNotificationsOpen(false);
            }
            if (!e.target.closest('[data-user-menu]')) {
                setUserDropdownOpen(false);
            }
            if (!e.target.closest('[data-dropdown]')) {
                setDropdowns({
                    trading: false,
                    analysis: false,
                    community: false,
                    ai: false,
                    market: false,
                    vault: false,
                });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <NavContainer>
            <NavInner>
                {/* LOGO */}
                <Logo to="/dashboard">
                    <LogoIcon>
                        <LogoImage src={nexusSignalLogo} alt="Nexus Signal Logo" />
                    </LogoIcon>
                    <LogoText>Nexus Signal</LogoText>
                </Logo>

                {/* DESKTOP NAV LINKS */}
                <NavLinks>
                    {/* Dashboard */}
                    <NavLink to="/dashboard" $active={location.pathname === '/dashboard'}>
                        <Home size={16} />
                        Dashboard
                    </NavLink>

                    {/* Vault Dropdown */}
                    <NavItem data-dropdown>
                        <DropdownTrigger
                            onClick={() => handleDropdownToggle('vault')}
                            $open={dropdowns.vault}
                            $active={location.pathname === '/vault' || location.pathname === '/equipped'}
                        >
                            <DollarSign size={16} />
                            Vault
                            <ChevronDown size={14} />
                        </DropdownTrigger>
                        {dropdowns.vault && (
                            <DropdownMenu>
                                <DropdownItem
                                    to="/vault"
                                    $active={location.pathname === '/vault'}
                                >
                                    <DollarSign size={16} />
                                    The Vault
                                </DropdownItem>
                                <DropdownItem
                                    to="/equipped"
                                    $active={location.pathname === '/equipped'}
                                >
                                    <Award size={16} />
                                    Equipped Items
                                </DropdownItem>
                            </DropdownMenu>
                        )}
                    </NavItem>

                    {/* Social Feed */}
                    <NavLink to="/feed" $active={location.pathname === '/feed'}>
                        <MessageCircle size={16} />
                        Feed
                    </NavLink>

                    {/* Trading Dropdown */}
                    <NavItem data-dropdown>
                        <DropdownTrigger
                            onClick={() => handleDropdownToggle('trading')}
                            $open={dropdowns.trading}
                            $active={isPathActive(navStructure.trading)}
                        >
                            <Briefcase size={16} />
                            Trading
                            <ChevronDown size={14} />
                        </DropdownTrigger>
                        {dropdowns.trading && (
                            <DropdownMenu>
                                {navStructure.trading.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <DropdownItem
                                            key={item.path}
                                            to={item.path}
                                            $active={location.pathname === item.path}
                                        >
                                            <Icon size={16} />
                                            {item.label}
                                        </DropdownItem>
                                    );
                                })}
                            </DropdownMenu>
                        )}
                    </NavItem>

                    {/* Analysis Dropdown */}
                    <NavItem data-dropdown>
                        <DropdownTrigger
                            onClick={() => handleDropdownToggle('analysis')}
                            $open={dropdowns.analysis}
                            $active={isPathActive(navStructure.analysis)}
                        >
                            <BarChart3 size={16} />
                            Analysis
                            <ChevronDown size={14} />
                        </DropdownTrigger>
                        {dropdowns.analysis && (
                            <DropdownMenu>
                                {navStructure.analysis.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <DropdownItem
                                            key={item.path}
                                            to={item.path}
                                            $active={location.pathname === item.path}
                                        >
                                            <Icon size={16} />
                                            {item.label}
                                        </DropdownItem>
                                    );
                                })}
                            </DropdownMenu>
                        )}
                    </NavItem>

                    {/* Community Dropdown */}
                    <NavItem data-dropdown>
                        <DropdownTrigger
                            onClick={() => handleDropdownToggle('community')}
                            $open={dropdowns.community}
                            $active={isPathActive(navStructure.community)}
                        >
                            <Users size={16} />
                            Community
                            <ChevronDown size={14} />
                        </DropdownTrigger>
                        {dropdowns.community && (
                            <DropdownMenu>
                                {navStructure.community.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <DropdownItem
                                            key={item.path}
                                            to={item.path}
                                            $active={location.pathname === item.path}
                                        >
                                            <Icon size={16} />
                                            {item.label}
                                        </DropdownItem>
                                    );
                                })}
                                <DropdownItem
                                    to="/achievements/browse"
                                    $active={location.pathname === '/achievements/browse'}
                                >
                                    <Award size={16} />
                                    Browse Achievements
                                </DropdownItem>
                            </DropdownMenu>  
                        )}
                    </NavItem>

                    {/* AI Tools Dropdown */}
                    <NavItem data-dropdown>
                        <DropdownTrigger
                            onClick={() => handleDropdownToggle('ai')}
                            $open={dropdowns.ai}
                            $active={isPathActive(navStructure.ai)}
                        >
                            <Zap size={16} />
                            AI Tools
                            <ChevronDown size={14} />
                        </DropdownTrigger>
                        {dropdowns.ai && (
                            <DropdownMenu>
                                {navStructure.ai.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <DropdownItem
                                            key={item.path}
                                            to={item.path}
                                            $active={location.pathname === item.path}
                                        >
                                            <Icon size={16} />
                                            {item.label}
                                        </DropdownItem>
                                    );
                                })}
                            </DropdownMenu>
                        )}
                    </NavItem>

                    {/* Market Dropdown */}
                    <NavItem data-dropdown>
                        <DropdownTrigger
                            onClick={() => handleDropdownToggle('market')}
                            $open={dropdowns.market}
                            $active={isPathActive(navStructure.market)}
                        >
                            <Globe size={16} />
                            Market
                            <ChevronDown size={14} />
                        </DropdownTrigger>
                        {dropdowns.market && (
                            <DropdownMenu>
                                {navStructure.market.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <DropdownItem
                                            key={item.path}
                                            to={item.path}
                                            $active={location.pathname === item.path}
                                        >
                                            <Icon size={16} />
                                            {item.label}
                                        </DropdownItem>
                                    );
                                })}
                            </DropdownMenu>
                        )}
                    </NavItem>

                    {/* Pricing */}
                    <NavLink to="/pricing" $active={location.pathname === '/pricing'}>
                        <DollarSign size={16} />
                        Pricing
                    </NavLink>
                </NavLinks>

                {/* USER SECTION */}
                <UserSection>
                    {/* Gamification Navbar Component */}
                    <NavbarGamification />

                    {/* NOTIFICATION BELL */}
                    <div style={{ position: 'relative' }}>
                        <NotificationButton 
                            onClick={() => {
                                setNotificationsOpen(!notificationsOpen);
                                setUserDropdownOpen(false);
                                setDropdowns({
                                    trading: false,
                                    analysis: false,
                                    community: false,
                                    ai: false,
                                    market: false,
                                    vault: false,
                                });
                            }}
                            data-notification-button
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <NotificationBadge>{unreadCount}</NotificationBadge>
                            )}
                        </NotificationButton>

                        {notificationsOpen && (
                            <NotificationPanel data-notification-panel>
                                <NotificationHeader>
                                    <NotificationTitle>Notifications</NotificationTitle>
                                    {unreadCount > 0 && (
                                        <MarkAllRead onClick={handleMarkAllRead}>
                                            Mark all read
                                        </MarkAllRead>
                                    )}
                                </NotificationHeader>
                                <NotificationList>
                                    {notifications.length === 0 ? (
                                        <EmptyState>
                                            <EmptyStateIcon>
                                                <Bell size={32} />
                                            </EmptyStateIcon>
                                            <EmptyStateText>No notifications yet</EmptyStateText>
                                        </EmptyState>
                                    ) : (
                                        notifications.map(notification => {
                                            const Icon = notification.icon;
                                            return (
                                                <NotificationItem
                                                    key={notification.id}
                                                    $unread={notification.unread}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    {notification.unread && <UnreadDot />}
                                                    <NotificationItemHeader>
                                                        <NotificationIcon $type={notification.type}>
                                                            <Icon size={20} />
                                                        </NotificationIcon>
                                                        <NotificationContent>
                                                            <NotificationItemTitle>
                                                                {notification.title}
                                                            </NotificationItemTitle>
                                                            <NotificationItemText>
                                                                {notification.text}
                                                            </NotificationItemText>
                                                            <NotificationTime>
                                                                <Clock size={12} />
                                                                {notification.time}
                                                            </NotificationTime>
                                                        </NotificationContent>
                                                    </NotificationItemHeader>
                                                </NotificationItem>
                                            );
                                        })
                                    )}
                                </NotificationList>
                            </NotificationPanel>
                        )}
                    </div>

                    {/* USER MENU */}
                    <div style={{ position: 'relative' }} data-user-menu>
                        <UserMenuButton onClick={() => {
                            setUserDropdownOpen(!userDropdownOpen);
                            setNotificationsOpen(false);
                            setDropdowns({
                                trading: false,
                                analysis: false,
                                community: false,
                                ai: false,
                                market: false,
                                vault: false,
                            });
                        }}>
                            <UserAvatar $src={user?.profile?.avatar}>
                                {user?.profile?.avatar ? (
                                    <AvatarImage 
                                        src={user.profile.avatar} 
                                        alt={user?.name || 'User'}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <AvatarInitials>
                                        {getUserInitials()}
                                    </AvatarInitials>
                                )}
                            </UserAvatar>
                            <UserName>{user?.name || 'User'}</UserName>
                            <DropdownIcon size={18} $open={userDropdownOpen} />
                        </UserMenuButton>

                        {userDropdownOpen && (
                            <UserDropdownMenu>
                                <UserDropdownItem onClick={() => {
                                    navigate('/profile');
                                    setUserDropdownOpen(false);
                                }}>
                                    <User size={18} />
                                    Profile
                                </UserDropdownItem>
                                <UserDropdownItem onClick={() => {
                                    navigate('/settings');
                                    setUserDropdownOpen(false);
                                }}>
                                    <Settings size={18} />
                                    Settings
                                </UserDropdownItem>
                                <UserDropdownItem className="danger" onClick={handleLogout}>
                                    <LogOut size={18} />
                                    Logout
                                </UserDropdownItem>
                            </UserDropdownMenu>
                        )}
                    </div>

                    <MobileMenuButton onClick={handleMobileMenuToggle}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </MobileMenuButton>
                </UserSection>
            </NavInner>

            {/* MOBILE MENU */}
            <MobileMenu $open={mobileMenuOpen}>
                <MobileNavLinks>
                    <MobileNavLink 
                        to="/dashboard" 
                        $active={location.pathname === '/dashboard'}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Home size={22} />
                        Dashboard
                    </MobileNavLink>

                    {/* Vault Category */}
                    <MobileNavCategory>
                        <MobileCategoryTitle>
                            <DollarSign size={16} />
                            Vault
                        </MobileCategoryTitle>
                        <MobileNavLink 
                            to="/vault" 
                            $active={location.pathname === '/vault'}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <DollarSign size={22} />
                            The Vault
                        </MobileNavLink>
                        <MobileNavLink 
                            to="/equipped" 
                            $active={location.pathname === '/equipped'}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Award size={22} />
                            Equipped Items
                        </MobileNavLink>
                    </MobileNavCategory>

                    <MobileNavLink 
                        to="/feed" 
                        $active={location.pathname === '/feed'}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <MessageCircle size={22} />
                        Social Feed
                    </MobileNavLink>

                    <MobileNavCategory>
                        <MobileCategoryTitle>
                            <Briefcase size={16} />
                            Trading
                        </MobileCategoryTitle>
                        {navStructure.trading.map(item => {
                            const Icon = item.icon;
                            return (
                                <MobileNavLink
                                    key={item.path}
                                    to={item.path}
                                    $active={location.pathname === item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon size={22} />
                                    {item.label}
                                </MobileNavLink>
                            );
                        })}
                    </MobileNavCategory>

                    <MobileNavCategory>
                        <MobileCategoryTitle>
                            <BarChart3 size={16} />
                            Analysis
                        </MobileCategoryTitle>
                        {navStructure.analysis.map(item => {
                            const Icon = item.icon;
                            return (
                                <MobileNavLink
                                    key={item.path}
                                    to={item.path}
                                    $active={location.pathname === item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon size={22} />
                                    {item.label}
                                </MobileNavLink>
                            );
                        })}
                    </MobileNavCategory>

                    <MobileNavCategory>
                        <MobileCategoryTitle>
                            <Users size={16} />
                            Community
                        </MobileCategoryTitle>
                        {navStructure.community.map(item => {
                            const Icon = item.icon;
                            return (
                                <MobileNavLink
                                    key={item.path}
                                    to={item.path}
                                    $active={location.pathname === item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon size={22} />
                                    {item.label}
                                </MobileNavLink>
                            );
                        })}
                        <MobileNavLink
                            to="/achievements/browse"
                            $active={location.pathname === '/achievements/browse'}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Award size={22} />
                            Browse Achievements
                        </MobileNavLink>
                    </MobileNavCategory>

                    <MobileNavCategory>
                        <MobileCategoryTitle>
                            <Zap size={16} />
                            AI Tools
                        </MobileCategoryTitle>
                        {navStructure.ai.map(item => {
                            const Icon = item.icon;
                            return (
                                <MobileNavLink
                                    key={item.path}
                                    to={item.path}
                                    $active={location.pathname === item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon size={22} />
                                    {item.label}
                                </MobileNavLink>
                            );
                        })}
                    </MobileNavCategory>

                    <MobileNavCategory>
                        <MobileCategoryTitle>
                            <Globe size={16} />
                            Market
                        </MobileCategoryTitle>
                        {navStructure.market.map(item => {
                            const Icon = item.icon;
                            return (
                                <MobileNavLink
                                    key={item.path}
                                    to={item.path}
                                    $active={location.pathname === item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <Icon size={22} />
                                    {item.label}
                                </MobileNavLink>
                            );
                        })}
                    </MobileNavCategory>

                    <Divider />
                    
                    <MobileNavLink 
                        to="/pricing" 
                        $active={location.pathname === '/pricing'}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <DollarSign size={22} />
                        Pricing
                    </MobileNavLink>
                    
                    <MobileNavLink 
                        to="/profile" 
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <User size={22} />
                        Profile
                    </MobileNavLink>
                    
                    <MobileNavLink 
                        to="/settings" 
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Settings size={22} />
                        Settings
                    </MobileNavLink>
                    
                    <MobileNavLink
                        as="button"
                        style={{ 
                            border: 'none', 
                            width: '100%',
                            color: '#ef4444'
                        }}
                        onClick={handleLogout}
                    >
                        <LogOut size={22} />
                        Logout
                    </MobileNavLink>
                </MobileNavLinks>
            </MobileMenu>
        </NavContainer>
    );
};

export default Navbar;