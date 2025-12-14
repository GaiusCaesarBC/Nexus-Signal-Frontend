

// client/src/components/Navbar.js - FULLY THEMED NAVBAR
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NavbarGamification from './gamification/NavbarGamification';
import { useGamification } from '../context/GamificationContext';

import {
    Home, TrendingUp, PieChart, Eye, Filter, MapPin, Newspaper, BookOpen, Brain, MessageSquare,
    DollarSign, LogOut, LogIn, User, Menu, X, ChevronDown, Zap, Users,
    Settings, Bell, CheckCircle, AlertCircle, TrendingUp as TrendingUpIcon,
    DollarSign as DollarIcon, Clock, ArrowUpRight, ArrowDownRight, Trophy, Twitter,
    Briefcase, BarChart3, Activity, Sparkles, Globe, Calculator, TrendingDown, MessageCircle, Award, Waves,
    Search, Bitcoin, LineChart, UserPlus
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

// ============ STYLED COMPONENTS ============
const NavContainer = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: ${props => {
        // Create a semi-transparent version based on the theme's page background
        // Extract the darkest color from the theme and make it slightly transparent
        const primary = props.theme.brand?.primary || '#00adef';
        return `linear-gradient(135deg, rgba(10, 14, 30, 0.95) 0%, rgba(15, 20, 40, 0.95) 100%)`;
    }};
    backdrop-filter: blur(20px);
    border-bottom: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}40`};
    box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.5),
        0 1px 0 ${props => `${props.theme.brand?.primary || '#00adef'}1a`} inset;
    animation: ${fadeIn} 0.5s ease-out;
    
    /* Subtle theme-colored glow at bottom */
    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: ${props => `linear-gradient(90deg, transparent, ${props.theme.brand?.primary || '#00adef'}66, transparent)`};
    }
`;

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
        height: 60px;
    }

    @media (max-width: 480px) {
        padding: 0 0.5rem;
        height: 54px;
        gap: 0.1rem;
    }
`;

// ============ LOGO ============
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

    filter: drop-shadow(0 0 5px ${props => `${props.theme.brand?.primary || '#00adef'}b3`})
            drop-shadow(0 0 10px ${props => `${props.theme.brand?.accent || props.theme.success || '#10b981'}80`})
            drop-shadow(0 0 15px ${props => `${props.theme.brand?.primary || '#00adef'}4D`});

    &::before {
        content: '';
        position: absolute;
        inset: 0px;
        background: radial-gradient(circle, 
            ${props => `${props.theme.brand?.primary || '#00adef'}33`} 0%, 
            ${props => `${props.theme.brand?.accent || props.theme.success || '#10b981'}1a`} 40%, 
            transparent 70%);
        border-radius: 50%;
        z-index: -1;
        opacity: 0.5;
        animation: ${pulse} 3s ease-in-out infinite;
    }

    &:hover {
        filter: drop-shadow(0 0 10px ${props => `${props.theme.brand?.primary || '#00adef'}e6`})
                drop-shadow(0 0 20px ${props => `${props.theme.brand?.accent || props.theme.success || '#10b981'}b3`})
                drop-shadow(0 0 35px ${props => `${props.theme.brand?.primary || '#00adef'}80`});
        transform: translateY(-3px) scale(1.08);
    }

    @media (max-width: 768px) {
        width: 40px;
        height: 40px;
    }

    @media (max-width: 480px) {
        width: 32px;
        height: 32px;
    }
`;

const LogoImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: relative;
    z-index: 1;
`;

const LogoText = styled.span`
    letter-spacing: 1px;
    font-size: 1rem;
    font-weight: 800;
    
    background: ${props => props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.accent || props.theme.success || '#10b981'} 50%, ${props.theme.brand?.primary || '#00adef'} 100%)`};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    filter: drop-shadow(0 0 10px ${props => `${props.theme.brand?.primary || '#00adef'}80`});
    
    transition: all 0.3s ease;

    &:hover {
        filter: drop-shadow(0 0 15px ${props => `${props.theme.brand?.primary || '#00adef'}b3`});
    }

    @media (max-width: 768px) {
        display: none;
    }
`;

// ============ SEARCH BAR ============
const SearchContainer = styled.div`
    position: relative;
    width: 240px;
    margin-right: 0.5rem;
    
    @media (max-width: 1200px) {
        width: 180px;
    }
    
    @media (max-width: 1024px) {
        display: none;
    }
`;

const SearchInputWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const SearchIconStyled = styled(Search)`
    position: absolute;
    left: 0.75rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    width: 16px;
    height: 16px;
    pointer-events: none;
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 0.5rem 1rem 0.5rem 2.25rem;
    background: ${props => `${props.theme.brand?.primary || '#00adef'}15`};
    border: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}33`};
    border-radius: 20px;
    color: ${props => props.theme.text?.primary || '#f8fafc'};
    font-size: 0.8rem;
    transition: all 0.2s ease;
    
    &::placeholder {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
    }
    
    &:focus {
        outline: none;
        border-color: ${props => props.theme.brand?.primary || '#00adef'};
        background: ${props => `${props.theme.brand?.primary || '#00adef'}25`};
        box-shadow: 0 0 0 3px ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
    }
`;

const SearchResults = styled.div`
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: ${props => props.theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.98)'};
    border: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
    border-radius: 12px;
    max-height: 350px;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    animation: ${slideDown} 0.2s ease;
    z-index: 9999;
    -webkit-overflow-scrolling: touch;
`;

const SearchResultsHeader = styled.div`
    padding: 0.6rem 1rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}33`};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SearchResultItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.8rem 1rem;
    cursor: pointer;
    transition: all 0.15s ease;
    border-bottom: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
    -webkit-tap-highlight-color: ${props => `${props.theme.brand?.primary || '#00adef'}33`};
    touch-action: manipulation;
    user-select: none;
    
    &:last-child {
        border-bottom: none;
    }
    
    &:hover, &:active {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
    }
    
    ${props => props.$selected && css`
        background: ${props => `${props.theme.brand?.primary || '#00adef'}26`};
    `}
`;

const SearchResultIconBox = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: ${props => props.$crypto ? `${props.theme.warning || '#f59e0b'}33` : `${props.theme.brand?.primary || '#00adef'}33`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$crypto ? props.theme.warning || '#f59e0b' : props.theme.brand?.primary || '#00adef'};
    font-weight: 600;
    font-size: 0.7rem;
`;

const SearchResultInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const SearchResultSymbol = styled.div`
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#f8fafc'};
    font-size: 0.85rem;
`;

const SearchResultName = styled.div`
    font-size: 0.7rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const SearchResultType = styled.span`
    font-size: 0.6rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    background: ${props => props.$crypto ? `${props.theme.warning || '#f59e0b'}33` : `${props.theme.brand?.primary || '#00adef'}33`};
    color: ${props => props.$crypto ? props.theme.warning || '#f59e0b' : props.theme.brand?.primary || '#00adef'};
    font-weight: 500;
    flex-shrink: 0;
`;

const NoResults = styled.div`
    padding: 1.5rem 1rem;
    text-align: center;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
`;

const SearchLoading = styled.div`
    padding: 1.5rem 1rem;
    text-align: center;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    
    &::after {
        content: '';
        width: 16px;
        height: 16px;
        border: 2px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
        border-top-color: ${props => props.theme.brand?.primary || '#00adef'};
        border-radius: 50%;
        animation: ${pulse} 0.8s linear infinite;
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

const NavLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.75rem;
    color: ${props => props.$active ? props.theme.brand?.primary || '#00adef' : props.theme.text?.secondary || '#94a3b8'};
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85rem;
    border-radius: 8px;
    position: relative;
    transition: all 0.3s ease;
    background: ${props => props.$active ? `${props.theme.brand?.primary || '#00adef'}26` : 'transparent'};
    border: 1px solid ${props => props.$active ? `${props.theme.brand?.primary || '#00adef'}4D` : 'transparent'};
    white-space: nowrap;

    &:hover {
        color: ${props => props.theme.brand?.primary || '#00adef'};
        background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
        border-color: ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
        transform: translateY(-2px);
    }
`;

const DropdownTrigger = styled.button`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.75rem;
    color: ${props => props.$active ? props.theme.brand?.primary || '#00adef' : props.theme.text?.secondary || '#94a3b8'};
    background: ${props => props.$active ? `${props.theme.brand?.primary || '#00adef'}26` : 'transparent'};
    border: 1px solid ${props => props.$active ? `${props.theme.brand?.primary || '#00adef'}4D` : 'transparent'};
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover {
        color: ${props => props.theme.brand?.primary || '#00adef'};
        background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
        border-color: ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
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
    background: ${props => props.theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.98)'};
    backdrop-filter: blur(20px);
    border: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
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
    color: ${props => props.$active ? props.theme.brand?.primary || '#00adef' : props.theme.text?.primary || '#f8fafc'};
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    border-bottom: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
    background: ${props => props.$active ? `${props.theme.brand?.primary || '#00adef'}26` : 'transparent'};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}26`};
        color: ${props => props.theme.brand?.primary || '#00adef'};
        padding-left: 1.5rem;
    }
`;

const DropdownDivider = styled.div`
    height: 1px;
    background: ${props => `${props.theme.brand?.primary || '#00adef'}33`};
    margin: 0.25rem 0;
`;

const DropdownLabel = styled.div`
    padding: 0.5rem 1.25rem 0.25rem;
    font-size: 0.65rem;
    font-weight: 700;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

// ============ USER SECTION ============
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

    @media (max-width: 480px) {
        gap: 0.25rem;
    }
`;

const NotificationButton = styled.button`
    position: relative;
    background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
    border: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
    color: ${props => props.theme.brand?.primary || '#00adef'};
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}33`};
        transform: translateY(-2px);
        box-shadow: 0 4px 15px ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
        
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
    background: ${props => `linear-gradient(135deg, ${props.theme.error || '#ef4444'} 0%, ${props.theme.error || '#ef4444'}cc 100%)`};
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
    background: ${props => props.theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.98)'};
    backdrop-filter: blur(20px);
    border: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
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
    border-bottom: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}33`};
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const NotificationTitle = styled.h3`
    color: ${props => props.theme.brand?.primary || '#00adef'};
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
`;

const MarkAllRead = styled.button`
    background: transparent;
    border: none;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const NotificationList = styled.div`
    overflow-y: auto;
    max-height: 400px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}0d`};
    }

    &::-webkit-scrollbar-thumb {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
        border-radius: 3px;

        &:hover {
            background: ${props => `${props.theme.brand?.primary || '#00adef'}80`};
        }
    }
`;

const NotificationItem = styled.div`
    padding: 1rem 1.25rem;
    border-bottom: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
    cursor: pointer;
    transition: all 0.2s ease;
    background: ${props => props.$unread ? `${props.theme.brand?.primary || '#00adef'}0d` : 'transparent'};
    position: relative;

    &:hover {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
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
        if (props.$type === 'success') return `${props.theme.success || '#10b981'}33`;
        if (props.$type === 'warning') return `${props.theme.warning || '#f59e0b'}33`;
        if (props.$type === 'error') return `${props.theme.error || '#ef4444'}33`;
        return `${props.theme.brand?.primary || '#00adef'}33`;
    }};
    color: ${props => {
        if (props.$type === 'success') return props.theme.success || '#10b981';
        if (props.$type === 'warning') return props.theme.warning || '#f59e0b';
        if (props.$type === 'error') return props.theme.error || '#ef4444';
        return props.theme.brand?.primary || '#00adef';
    }};
`;

const NotificationContent = styled.div`
    flex: 1;
`;

const NotificationItemTitle = styled.div`
    color: ${props => props.theme.text?.primary || '#f8fafc'};
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
`;

const NotificationItemText = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    line-height: 1.4;
`;

const NotificationTime = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
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
    background: ${props => props.theme.brand?.primary || '#00adef'};
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const EmptyState = styled.div`
    padding: 3rem 2rem;
    text-align: center;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
`;

const EmptyStateIcon = styled.div`
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    border-radius: 50%;
    background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const EmptyStateText = styled.div`
    font-size: 0.95rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const UserMenuButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: ${props => `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}26 0%, ${props.theme.brand?.primary || '#00adef'}0d 100%)`};
    border: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#f8fafc'};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
        background: ${props => `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'}40 0%, ${props.theme.brand?.primary || '#00adef'}1a 100%)`};
        transform: translateY(-2px);
        box-shadow: 0 4px 15px ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
    }

    @media (max-width: 768px) {
        padding: 0.4rem;
        gap: 0;
    }

    @media (max-width: 480px) {
        padding: 0.25rem;
        border-radius: 8px;
    }
`;

const UserAvatar = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: ${props => props.$src ? 
        `url(${props.$src}) center/cover` : 
        props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.accent || props.theme.success || '#10b981'} 100%)`
    };
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: ${props => props.$src ? '0' : '0.85rem'};
    color: white;
    box-shadow: 0 2px 10px ${props => `${props.theme.brand?.primary || '#00adef'}66`};
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
    color: ${props => props.theme.text?.primary || '#f8fafc'};
    
    @media (max-width: 768px) {
        display: none;
    }
`;

const DropdownIconStyled = styled(ChevronDown)`
    transition: transform 0.3s ease;
    transform: ${props => props.$open ? 'rotate(180deg)' : 'rotate(0)'};
    color: ${props => props.theme.text?.secondary || '#94a3b8'};

    @media (max-width: 768px) {
        display: none;
    }
`;

// ============ USER DROPDOWN MENU ============
const UserDropdownMenu = styled.div`
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: ${props => props.theme.bg?.cardSolid || 'rgba(15, 23, 42, 0.98)'};
    backdrop-filter: blur(20px);
    border: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
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
    color: ${props => props.theme.text?.primary || '#f8fafc'};
    text-align: left;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s ease;
    border-bottom: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}1a`};

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}26`};
        color: ${props => props.theme.brand?.primary || '#00adef'};
        padding-left: 1.5rem;
    }

    &.danger {
        color: ${props => props.theme.error || '#ef4444'};

        &:hover {
            background: ${props => `${props.theme.error || '#ef4444'}26`};
        }
    }
`;

// ============ MOBILE MENU ============
const MobileMenuButton = styled.button`
    display: none;
    background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
    border: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
    color: ${props => props.theme.brand?.primary || '#00adef'};
    width: 36px;
    height: 36px;
    border-radius: 8px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}33`};
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
    background: ${props => props.theme.bg?.page || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)'};
    backdrop-filter: blur(20px);
    z-index: 9999;
    animation: ${fadeIn} 0.3s ease-out;
    overflow-y: auto;
    display: ${props => props.$open ? 'block' : 'none'};
    border-top: 2px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};

    @media (max-width: 768px) {
        top: 60px;
        min-height: calc(100vh - 60px);
    }

    @media (max-width: 480px) {
        top: 54px;
        min-height: calc(100vh - 54px);
    }

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
    background: ${props => props.theme.bg?.page || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)'};
`;

const MobileNavCategory = styled.div`
    margin-bottom: 0.5rem;
`;

const MobileCategoryTitle = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
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
    color: ${props => props.$active ? props.theme.brand?.primary || '#00adef' : props.theme.text?.primary || '#f8fafc'};
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 12px;
    background: ${props => props.$active ? `${props.theme.brand?.primary || '#00adef'}26` : props.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${props => props.$active ? `${props.theme.brand?.primary || '#00adef'}4D` : `${props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.3)'}`};
    transition: all 0.2s ease;
    min-height: 56px;

    &:hover {
        color: ${props => props.theme.brand?.primary || '#00adef'};
        background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
        border-color: ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
        transform: translateX(5px);
    }
`;

const MobileSearchContainer = styled.div`
    margin-bottom: 1rem;
    position: relative;
    z-index: 100;
`;

const MobileGamificationSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.8)'};
    border-radius: 12px;
    border: 1px solid rgba(139, 92, 246, 0.3);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        border-color: rgba(139, 92, 246, 0.5);
        transform: translateY(-2px);
    }
`;

const MobileGamificationLevel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const MobileLevelBadge = styled.div`
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 1rem;
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
`;

const MobileLevelInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const MobileLevelText = styled.div`
    color: #a78bfa;
    font-weight: 700;
    font-size: 1rem;
`;

const MobileRankText = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 0.75rem;
`;

const MobileXPSection = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

const MobileXPLabel = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 0.75rem;
    display: flex;
    justify-content: space-between;
`;

const MobileXPBar = styled.div`
    width: 100%;
    height: 8px;
    background: rgba(139, 92, 246, 0.2);
    border-radius: 4px;
    overflow: hidden;
`;

const MobileXPFill = styled.div`
    height: 100%;
    width: ${props => props.$progress || 0}%;
    background: linear-gradient(90deg, #8b5cf6, #00adef);
    border-radius: 4px;
    transition: width 0.5s ease;
`;

const MobileCoinsSection = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 20px;
    color: #f59e0b;
    font-weight: 700;
    font-size: 0.9rem;
`;

const Divider = styled.div`
    height: 1px;
    background: ${props => `linear-gradient(90deg, transparent, ${props.theme.brand?.primary || '#00adef'}4D, transparent)`};
    margin: 1rem 0;
`;

// ============ AUTH BUTTONS ============
const AuthButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;
    
    @media (max-width: 768px) {
        gap: 0.5rem;
    }
`;

const LoginButton = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1.25rem;
    color: ${props => props.theme.brand?.primary || '#00adef'};
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 8px;
    background: transparent;
    border: 1px solid ${props => `${props.theme.brand?.primary || '#00adef'}4D`};
    transition: all 0.3s ease;
    
    &:hover {
        background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
        border-color: ${props => `${props.theme.brand?.primary || '#00adef'}80`};
        transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
    }
`;

const SignUpButton = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 1.25rem;
    color: #0a0e27;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    border-radius: 8px;
    background: ${props => props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.accent || props.theme.success || '#10b981'} 100%)`};
    border: none;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px ${props => `${props.theme.brand?.primary || '#00adef'}66`};
    }
    
    @media (max-width: 768px) {
        padding: 0.5rem 1rem;
        font-size: 0.85rem;
    }
`;

const PublicNavLinks = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
        display: none;
    }
`;

const PublicNavLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.6rem 0.75rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    text-decoration: none;
    font-weight: 600;
    font-size: 0.85rem;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
        color: ${props => props.theme.brand?.primary || '#00adef'};
        background: ${props => `${props.theme.brand?.primary || '#00adef'}1a`};
    }
`;

// ============ SEARCH DEBOUNCE HELPER ============
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============ COMPONENT ============
const Navbar = () => {
    const { user, logout, isAuthenticated, api } = useAuth();
    const { theme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { vault, gamificationData } = useGamification();
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const searchInputRef = useRef(null);
    
    const [dropdowns, setDropdowns] = useState({ trading: false, analysis: false, community: false });
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ stocks: [], crypto: [] });
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);

    const getIconForType = (type) => {
        switch (type) {
            case 'price_alert': return TrendingUpIcon;
            case 'prediction_expiry': return Clock;
            case 'prediction_result': return TrendingUpIcon;
            case 'portfolio_milestone': return Trophy;
            case 'achievement': return Award;
            case 'level_up': return Zap;
            case 'follow': return UserPlus;
            case 'like': return Activity;
            case 'comment': return MessageCircle;
            case 'reply': return MessageCircle;
            case 'mention': return MessageCircle;
            case 'share': return Activity;
            case 'leaderboard': return Trophy;
            case 'trade_copy': return TrendingUpIcon;
            case 'login_streak': return Zap;
            case 'welcome': return Sparkles;
            case 'system': return Bell;
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

    const fetchNotifications = async () => {
        if (!isAuthenticated || !user) return;
        try {
            const response = await api.get('/notifications');
            const mappedNotifications = (response.data.notifications || response.data || []).map(notif => {
                // Map notification type to display style, but preserve original type for navigation
                const getDisplayType = (type) => {
                    if (['price_alert', 'prediction_result'].includes(type)) return 'success';
                    if (['prediction_expiry'].includes(type)) return 'warning';
                    if (['achievement', 'level_up', 'login_streak'].includes(type)) return 'info';
                    if (['follow', 'like', 'comment', 'reply', 'mention', 'share'].includes(type)) return 'info';
                    return 'info';
                };

                return {
                    id: notif._id,
                    type: notif.type, // Preserve original type for navigation
                    displayType: getDisplayType(notif.type), // For styling
                    title: notif.title,
                    text: notif.message,
                    time: getTimeAgo(notif.createdAt),
                    unread: !notif.read,
                    icon: getIconForType(notif.type),
                    actionUrl: notif.actionUrl,
                    data: notif.data
                };
            });
            setNotifications(mappedNotifications);
        } catch (error) {
            if (error.response?.status !== 401) console.error('Failed to fetch notifications:', error);
        }
    };

    // ✅ FIXED: Fetch notifications on mount and periodically refresh
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // Fetch immediately on mount
        fetchNotifications();

        // Refresh notifications every 60 seconds
        const interval = setInterval(() => {
            fetchNotifications();
        }, 60000);

        return () => clearInterval(interval);
    }, [isAuthenticated, user]);

    const unreadCount = notifications.filter(n => n.unread).length;

    const performSearch = async (query) => {
        if (query.trim().length < 1) {
            setSearchResults({ stocks: [], crypto: [] });
            setShowSearchResults(false);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
            const data = response.data;
            setSearchResults({
                stocks: (data.stocks || []).map(s => ({ ...s, type: 'stock' })),
                crypto: (data.crypto || []).map(c => ({ ...c, type: 'crypto' }))
            });
            setShowSearchResults(true);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults({ stocks: [], crypto: [] });
        } finally {
            setIsSearching(false);
        }
    };

    const debouncedSearch = useRef(debounce((query) => performSearch(query), 300)).current;

    const handleSearch = (query) => {
        setSearchQuery(query);
        setSelectedIndex(-1);
        if (query.trim().length === 0) {
            setSearchResults({ stocks: [], crypto: [] });
            setShowSearchResults(false);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        setShowSearchResults(true);
        debouncedSearch(query);
    };

    const handleSearchSelect = (item) => {
        if (item.type === 'crypto') {
            navigate(`/crypto/${item.coinGeckoId || item.symbol}`);
        } else {
            navigate(`/stock/${item.symbol}`);
        }
        setSearchQuery('');
        setShowSearchResults(false);
        setSearchResults({ stocks: [], crypto: [] });
        setMobileMenuOpen(false);
    };

    const handleSearchKeyDown = async (e) => {
        const allResults = [...searchResults.stocks, ...searchResults.crypto];
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && allResults[selectedIndex]) {
                handleSearchSelect(allResults[selectedIndex]);
            } else if (searchQuery.trim()) {
                try {
                    const response = await api.get(`/search/validate/${encodeURIComponent(searchQuery.trim())}`);
                    const validation = response.data;
                    if (validation.valid) {
                        if (validation.type === 'crypto') navigate(`/crypto/${validation.coinGeckoId || validation.symbol}`);
                        else navigate(`/stock/${validation.symbol}`);
                    } else navigate(`/stock/${searchQuery.toUpperCase()}`);
                } catch (error) {
                    navigate(`/stock/${searchQuery.toUpperCase()}`);
                }
                setSearchQuery('');
                setShowSearchResults(false);
                setSearchResults({ stocks: [], crypto: [] });
                setMobileMenuOpen(false);
            }
        } else if (e.key === 'Escape') {
            setShowSearchResults(false);
            setSearchResults({ stocks: [], crypto: [] });
            searchInputRef.current?.blur();
        }
    };

    const navStructure = {
        trading: [
            { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
            { path: '/watchlist', label: 'Watchlist', icon: Eye },
            { path: '/alerts', label: 'Price Alerts', icon: Bell },
            { path: '/paper-trading', label: 'Paper Trading', icon: TrendingUp },
        ],
        analysis: [
            { path: '/screener', label: 'Screener', icon: Filter },
            { path: '/heatmap', label: 'Heatmap', icon: MapPin },
            { path: '/sentiment', label: 'Sentiment', icon: Activity },
            { path: '/compare', label: 'Stock Comparison', icon: BarChart3 },
            { path: '/whale-alerts', label: 'Whale Alerts', icon: Waves },
            { path: '/predict', label: 'AI Predict', icon: Brain, section: 'AI Tools' },
            { path: '/chat', label: 'AI Chat', icon: MessageSquare },
            { path: '/news', label: 'News', icon: Newspaper, section: 'Market' },
            { path: '/calculators', label: 'Calculators', icon: Calculator },
        ],
        community: [
            { path: '/feed', label: 'Social Feed', icon: MessageCircle },
            { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
            { path: '/discover', label: 'Discover Traders', icon: Sparkles },
            { path: '/journal', label: 'Journal', icon: BookOpen },
            { path: '/achievements/browse', label: 'Achievements', icon: Award },
            { path: '/vault', label: 'The Vault', icon: DollarSign, section: 'Rewards' },
            { path: '/equipped', label: 'Equipped Items', icon: Award },
        ],
    };

    const handleDropdownToggle = (dropdown) => {
        setDropdowns({
            trading: dropdown === 'trading' ? !dropdowns.trading : false,
            analysis: dropdown === 'analysis' ? !dropdowns.analysis : false,
            community: dropdown === 'community' ? !dropdowns.community : false,
        });
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
    };

    const handleLogout = () => { logout(); navigate('/login'); setUserDropdownOpen(false); setMobileMenuOpen(false); };
    const handleMobileMenuToggle = () => { setMobileMenuOpen(!mobileMenuOpen); setUserDropdownOpen(false); setNotificationsOpen(false); if (mobileMenuOpen) { setSearchQuery(''); setShowSearchResults(false); setSearchResults({ stocks: [], crypto: [] }); } };
    
    const handleNotificationClick = async (notification) => {
        try {
            await api.put(`/notifications/${notification.id}/read`);
            setNotifications(notifications.map(n => n.id === notification.id ? { ...n, unread: false } : n));

            // Use actionUrl if provided, otherwise navigate based on type
            if (notification.actionUrl) {
                navigate(notification.actionUrl);
            } else {
                // Navigate based on notification type
                switch (notification.type) {
                    case 'price_alert':
                        navigate('/watchlist');
                        break;
                    case 'prediction_expiry':
                    case 'prediction_result':
                        navigate('/predict');
                        break;
                    case 'achievement':
                        navigate('/achievements/browse');
                        break;
                    case 'level_up':
                    case 'login_streak':
                        navigate('/profile');
                        break;
                    case 'follow':
                        // Navigate to follower's profile if data available
                        if (notification.data?.followerId) {
                            navigate(`/profile/${notification.data.followerId}`);
                        } else {
                            navigate('/profile');
                        }
                        break;
                    case 'like':
                    case 'comment':
                    case 'reply':
                    case 'mention':
                    case 'share':
                        // Navigate to post if data available
                        if (notification.data?.postId) {
                            navigate(`/post/${notification.data.postId}`);
                        } else {
                            navigate('/feed');
                        }
                        break;
                    case 'portfolio_milestone':
                        navigate('/portfolio');
                        break;
                    case 'leaderboard':
                        navigate('/leaderboard');
                        break;
                    case 'trade_copy':
                        navigate('/paper-trading');
                        break;
                    default:
                        navigate('/dashboard');
                }
            }
            setNotificationsOpen(false);
        } catch (error) {
            console.error('Failed to mark as read:', error);
            setNotificationsOpen(false);
        }
    };

    const handleMarkAllRead = async () => {
        try { await api.post('/notifications/mark-all-read'); setNotifications(notifications.map(n => ({ ...n, unread: false }))); } catch (error) { console.error('Failed to mark all as read:', error); }
    };

    const getUserInitials = () => { if (!user?.name) return 'U'; return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2); };
    const isPathActive = (paths) => paths.some(item => location.pathname === item.path);

    useEffect(() => { setMobileMenuOpen(false); setUserDropdownOpen(false); setNotificationsOpen(false); setShowSearchResults(false); setSearchQuery(''); setSearchResults({ stocks: [], crypto: [] }); setDropdowns({ trading: false, analysis: false, community: false }); }, [location]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('[data-notification-panel]') && !e.target.closest('[data-notification-button]')) setNotificationsOpen(false);
            if (!e.target.closest('[data-user-menu]')) setUserDropdownOpen(false);
            if (!e.target.closest('[data-dropdown]')) setDropdowns({ trading: false, analysis: false, community: false });
            if (searchRef.current && !searchRef.current.contains(e.target) && mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) setShowSearchResults(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderDropdownItems = (items) => {
        let currentSection = null;
        return items.map((item) => {
            const Icon = item.icon;
            const showSection = item.section && item.section !== currentSection;
            if (item.section) currentSection = item.section;
            return (
                <React.Fragment key={item.path}>
                    {showSection && (<><DropdownDivider /><DropdownLabel>{item.section}</DropdownLabel></>)}
                    <DropdownItem to={item.path} $active={location.pathname === item.path}><Icon size={16} />{item.label}</DropdownItem>
                </React.Fragment>
            );
        });
    };

    return (
        <NavContainer>
            <NavInner>
                <Logo to={isAuthenticated ? "/dashboard" : "/"}><LogoIcon><LogoImage src={nexusSignalLogo} alt="Nexus Signal Logo" /></LogoIcon><LogoText>Nexus Signal</LogoText></Logo>
                {isAuthenticated ? (
                    <>
                        <SearchContainer ref={searchRef}>
                            <SearchInputWrapper><SearchIconStyled size={16} /><SearchInput ref={searchInputRef} type="text" placeholder="Search stocks & crypto..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} onFocus={() => searchQuery && setShowSearchResults(true)} onKeyDown={handleSearchKeyDown} /></SearchInputWrapper>
                            {showSearchResults && isSearching && <SearchResults><SearchLoading>Searching...</SearchLoading></SearchResults>}
                            {showSearchResults && !isSearching && (searchResults.stocks.length > 0 || searchResults.crypto.length > 0) && (
                                <SearchResults>
                                    {searchResults.stocks.length > 0 && (<><SearchResultsHeader><LineChart size={14} />Stocks</SearchResultsHeader>{searchResults.stocks.map((stock, idx) => (<SearchResultItem key={stock.symbol} onClick={() => handleSearchSelect(stock)} $selected={selectedIndex === idx}><SearchResultIconBox>{stock.symbol.slice(0, 2)}</SearchResultIconBox><SearchResultInfo><SearchResultSymbol>{stock.symbol}</SearchResultSymbol><SearchResultName>{stock.name}</SearchResultName></SearchResultInfo><SearchResultType>Stock</SearchResultType></SearchResultItem>))}</>)}
                                    {searchResults.crypto.length > 0 && (<><SearchResultsHeader><Bitcoin size={14} />Crypto</SearchResultsHeader>{searchResults.crypto.map((crypto, idx) => (<SearchResultItem key={crypto.symbol + (crypto.coinGeckoId || '')} onClick={() => handleSearchSelect(crypto)} $selected={selectedIndex === searchResults.stocks.length + idx}><SearchResultIconBox $crypto>{crypto.symbol.slice(0, 2)}</SearchResultIconBox><SearchResultInfo><SearchResultSymbol>{crypto.symbol}</SearchResultSymbol><SearchResultName>{crypto.name}</SearchResultName></SearchResultInfo><SearchResultType $crypto>Crypto</SearchResultType></SearchResultItem>))}</>)}
                                </SearchResults>
                            )}
                            {showSearchResults && !isSearching && searchQuery && searchResults.stocks.length === 0 && searchResults.crypto.length === 0 && <SearchResults><NoResults>No results for "{searchQuery}"<br /><small style={{ color: theme.text?.tertiary }}>Press Enter to search anyway</small></NoResults></SearchResults>}
                        </SearchContainer>
                        <NavLinks>
                            <NavLink to="/dashboard" $active={location.pathname === '/dashboard'}><Home size={16} />Dashboard</NavLink>
                            <NavItem data-dropdown><DropdownTrigger onClick={() => handleDropdownToggle('trading')} $open={dropdowns.trading} $active={isPathActive(navStructure.trading)}><Briefcase size={16} />Trading<ChevronDown size={14} /></DropdownTrigger>{dropdowns.trading && <DropdownMenu>{navStructure.trading.map(item => { const Icon = item.icon; return <DropdownItem key={item.path} to={item.path} $active={location.pathname === item.path}><Icon size={16} />{item.label}</DropdownItem>; })}</DropdownMenu>}</NavItem>
                            <NavItem data-dropdown><DropdownTrigger onClick={() => handleDropdownToggle('analysis')} $open={dropdowns.analysis} $active={isPathActive(navStructure.analysis)}><BarChart3 size={16} />Analysis<ChevronDown size={14} /></DropdownTrigger>{dropdowns.analysis && <DropdownMenu>{renderDropdownItems(navStructure.analysis)}</DropdownMenu>}</NavItem>
                            <NavItem data-dropdown><DropdownTrigger onClick={() => handleDropdownToggle('community')} $open={dropdowns.community} $active={isPathActive(navStructure.community)}><Users size={16} />Community<ChevronDown size={14} /></DropdownTrigger>{dropdowns.community && <DropdownMenu>{renderDropdownItems(navStructure.community)}</DropdownMenu>}</NavItem>
                            <NavLink to="/pricing" $active={location.pathname === '/pricing'}><DollarSign size={16} />Pricing</NavLink>
                        </NavLinks>
                        <UserSection>
                            <NavbarGamification />
                            <div style={{ position: 'relative' }}>
                                <NotificationButton onClick={() => { setNotificationsOpen(!notificationsOpen); setUserDropdownOpen(false); setDropdowns({ trading: false, analysis: false, community: false }); }} data-notification-button><Bell size={20} />{unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}</NotificationButton>
                                {notificationsOpen && (
                                    <NotificationPanel data-notification-panel>
                                        <NotificationHeader><NotificationTitle>Notifications</NotificationTitle>{unreadCount > 0 && <MarkAllRead onClick={handleMarkAllRead}>Mark all read</MarkAllRead>}</NotificationHeader>
                                        <NotificationList>
                                            {notifications.length === 0 ? <EmptyState><EmptyStateIcon><Bell size={32} /></EmptyStateIcon><EmptyStateText>No notifications yet</EmptyStateText></EmptyState> : notifications.map(notification => { const Icon = notification.icon; return (<NotificationItem key={notification.id} $unread={notification.unread} onClick={() => handleNotificationClick(notification)}>{notification.unread && <UnreadDot />}<NotificationItemHeader><NotificationIcon $type={notification.displayType || notification.type}><Icon size={20} /></NotificationIcon><NotificationContent><NotificationItemTitle>{notification.title}</NotificationItemTitle><NotificationItemText>{notification.text}</NotificationItemText><NotificationTime><Clock size={12} />{notification.time}</NotificationTime></NotificationContent></NotificationItemHeader></NotificationItem>); })}
                                        </NotificationList>
                                    </NotificationPanel>
                                )}
                            </div>
                            <div style={{ position: 'relative' }} data-user-menu>
                               <UserMenuButton onClick={() => { setUserDropdownOpen(!userDropdownOpen); setNotificationsOpen(false); setDropdowns({ trading: false, analysis: false, community: false }); }}>
    <User size={18} />
    <UserName>{user?.name || 'User'}</UserName>
    <DropdownIconStyled size={18} $open={userDropdownOpen} />
</UserMenuButton>
                                {userDropdownOpen && <UserDropdownMenu><UserDropdownItem onClick={() => { navigate('/profile'); setUserDropdownOpen(false); }}><User size={18} />Profile</UserDropdownItem><UserDropdownItem onClick={() => { navigate('/settings'); setUserDropdownOpen(false); }}><Settings size={18} />Settings</UserDropdownItem><UserDropdownItem className="danger" onClick={handleLogout}><LogOut size={18} />Logout</UserDropdownItem></UserDropdownMenu>}
                            </div>
                            <MobileMenuButton onClick={handleMobileMenuToggle}>{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</MobileMenuButton>
                        </UserSection>
                        <MobileMenu $open={mobileMenuOpen}>
                            <MobileNavLinks>
                                <MobileSearchContainer ref={mobileSearchRef}>
                                    <SearchInputWrapper><SearchIconStyled size={16} /><SearchInput type="text" placeholder="Search stocks & crypto..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} onFocus={() => searchQuery && setShowSearchResults(true)} onKeyDown={handleSearchKeyDown} style={{ width: '100%' }} /></SearchInputWrapper>
                                    {showSearchResults && isSearching && <SearchResults style={{ position: 'relative', top: '8px', marginBottom: '1rem' }}><SearchLoading>Searching...</SearchLoading></SearchResults>}
                                    {showSearchResults && !isSearching && (searchResults.stocks.length > 0 || searchResults.crypto.length > 0) && (
                                        <SearchResults style={{ position: 'relative', top: '8px', marginBottom: '1rem' }}>
                                            {searchResults.stocks.length > 0 && (<><SearchResultsHeader><LineChart size={14} />Stocks</SearchResultsHeader>{searchResults.stocks.map((stock, idx) => (<SearchResultItem key={stock.symbol} onClick={() => handleSearchSelect(stock)} onTouchEnd={(e) => { e.preventDefault(); handleSearchSelect(stock); }} $selected={selectedIndex === idx}><SearchResultIconBox>{stock.symbol.slice(0, 2)}</SearchResultIconBox><SearchResultInfo><SearchResultSymbol>{stock.symbol}</SearchResultSymbol><SearchResultName>{stock.name}</SearchResultName></SearchResultInfo><SearchResultType>Stock</SearchResultType></SearchResultItem>))}</>)}
                                            {searchResults.crypto.length > 0 && (<><SearchResultsHeader><Bitcoin size={14} />Crypto</SearchResultsHeader>{searchResults.crypto.map((crypto, idx) => (<SearchResultItem key={crypto.symbol + (crypto.coinGeckoId || '')} onClick={() => handleSearchSelect(crypto)} onTouchEnd={(e) => { e.preventDefault(); handleSearchSelect(crypto); }} $selected={selectedIndex === searchResults.stocks.length + idx}><SearchResultIconBox $crypto>{crypto.symbol.slice(0, 2)}</SearchResultIconBox><SearchResultInfo><SearchResultSymbol>{crypto.symbol}</SearchResultSymbol><SearchResultName>{crypto.name}</SearchResultName></SearchResultInfo><SearchResultType $crypto>Crypto</SearchResultType></SearchResultItem>))}</>)}
                                        </SearchResults>
                                    )}
                                    {showSearchResults && !isSearching && searchQuery && searchResults.stocks.length === 0 && searchResults.crypto.length === 0 && <SearchResults style={{ position: 'relative', top: '8px', marginBottom: '1rem' }}><NoResults>No results for "{searchQuery}"<br /><small style={{ color: theme.text?.tertiary }}>Press Enter to search anyway</small></NoResults></SearchResults>}
                                </MobileSearchContainer>

                                {/* Mobile Gamification Stats */}
                                {gamificationData && (
                                    <MobileGamificationSection onClick={() => { navigate('/achievements'); setMobileMenuOpen(false); }}>
                                        <MobileGamificationLevel>
                                            <MobileLevelBadge>
                                                <Zap size={20} />
                                            </MobileLevelBadge>
                                            <MobileLevelInfo>
                                                <MobileLevelText>Level {gamificationData.level}</MobileLevelText>
                                                <MobileRankText>{gamificationData.rank}</MobileRankText>
                                            </MobileLevelInfo>
                                        </MobileGamificationLevel>
                                        <MobileXPSection>
                                            <MobileXPLabel>
                                                <span>XP Progress</span>
                                                <span>{Math.floor(gamificationData.xpInCurrentLevel || 0)}/{Math.floor((gamificationData.xpForNextLevel || 0) - Math.pow((gamificationData.level || 1) - 1, 2) * 100)}</span>
                                            </MobileXPLabel>
                                            <MobileXPBar>
                                                <MobileXPFill $progress={gamificationData.progressPercent || 0} />
                                            </MobileXPBar>
                                        </MobileXPSection>
                                        <MobileCoinsSection>
                                            <Zap size={16} />
                                            {(gamificationData.nexusCoins || 0) >= 1000
                                                ? `${((gamificationData.nexusCoins || 0) / 1000).toFixed(1)}k`
                                                : gamificationData.nexusCoins || 0
                                            }
                                        </MobileCoinsSection>
                                    </MobileGamificationSection>
                                )}

                                <MobileNavLink to="/dashboard" $active={location.pathname === '/dashboard'} onClick={() => setMobileMenuOpen(false)}><Home size={22} />Dashboard</MobileNavLink>
                                <MobileNavCategory><MobileCategoryTitle><Briefcase size={16} />Trading</MobileCategoryTitle>{navStructure.trading.map(item => { const Icon = item.icon; return <MobileNavLink key={item.path} to={item.path} $active={location.pathname === item.path} onClick={() => setMobileMenuOpen(false)}><Icon size={22} />{item.label}</MobileNavLink>; })}</MobileNavCategory>
                                <MobileNavCategory><MobileCategoryTitle><BarChart3 size={16} />Analysis & Tools</MobileCategoryTitle>{navStructure.analysis.map(item => { const Icon = item.icon; return <MobileNavLink key={item.path} to={item.path} $active={location.pathname === item.path} onClick={() => setMobileMenuOpen(false)}><Icon size={22} />{item.label}</MobileNavLink>; })}</MobileNavCategory>
                                <MobileNavCategory><MobileCategoryTitle><Users size={16} />Community & Rewards</MobileCategoryTitle>{navStructure.community.map(item => { const Icon = item.icon; return <MobileNavLink key={item.path} to={item.path} $active={location.pathname === item.path} onClick={() => setMobileMenuOpen(false)}><Icon size={22} />{item.label}</MobileNavLink>; })}</MobileNavCategory>
                                <Divider />
                                <MobileNavLink to="/pricing" $active={location.pathname === '/pricing'} onClick={() => setMobileMenuOpen(false)}><DollarSign size={22} />Pricing</MobileNavLink>
                                <MobileNavLink to="/profile" onClick={() => setMobileMenuOpen(false)}><User size={22} />Profile</MobileNavLink>
                                <MobileNavLink to="/settings" onClick={() => setMobileMenuOpen(false)}><Settings size={22} />Settings</MobileNavLink>
                                <MobileNavLink as="button" style={{ border: 'none', width: '100%', color: theme.error }} onClick={handleLogout}><LogOut size={22} />Logout</MobileNavLink>
                            </MobileNavLinks>
                        </MobileMenu>
                    </>
                ) : (
                    <>
                        <PublicNavLinks><PublicNavLink to="/pricing"><DollarSign size={16} />Pricing</PublicNavLink></PublicNavLinks>
                        <AuthButtons><LoginButton to="/login"><LogIn size={16} />Log In</LoginButton><SignUpButton to="/register"><UserPlus size={16} />Sign Up Free</SignUpButton></AuthButtons>
                    </>
                )}
            </NavInner>
        </NavContainer>
    );
};

export default Navbar;