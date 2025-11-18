// client/src/components/Navbar.js - THE SICKEST NAVBAR EVER (WITH REAL LOGO!)

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    Home, TrendingUp, PieChart, Eye, Brain, MessageSquare,
    DollarSign, LogOut, User, Menu, X, ChevronDown, Zap,
    Settings, Bell
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

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.6); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
`;

// ============ STYLED COMPONENTS ============
const NavContainer = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(10, 14, 39, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 173, 237, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    animation: ${fadeIn} 0.5s ease-out;
`;

const NavInner = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80px;

    @media (max-width: 768px) {
        padding: 0 1rem;
    }
`;

// ============ LOGO ============
const Logo = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: 900;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        filter: brightness(1.2);
    }

    &::before {
        content: '';
        position: absolute;
        left: -10px;
        width: 4px;
        height: 100%;
        background: linear-gradient(180deg, #00adef, #00ff88);
        border-radius: 2px;
        animation: ${pulse} 2s ease-in-out infinite;
    }
`;

const LogoIcon = styled.div`
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    filter: drop-shadow(0 0 10px rgba(0, 173, 237, 0.8)) 
            drop-shadow(0 0 20px rgba(0, 173, 237, 0.6))
            drop-shadow(0 0 30px rgba(0, 173, 237, 0.4));
    animation: ${glow} 3s ease-in-out infinite, ${float} 3s ease-in-out infinite;
    transition: all 0.3s ease;

    &:hover {
        filter: drop-shadow(0 0 15px rgba(0, 173, 237, 1)) 
                drop-shadow(0 0 30px rgba(0, 173, 237, 0.8))
                drop-shadow(0 0 45px rgba(0, 173, 237, 0.6));
        transform: scale(1.1);
    }
`;

const LogoImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
`;

const LogoText = styled.span`
    letter-spacing: 1px;
`;

// ============ NAV LINKS ============
const NavLinks = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: 768px) {
        display: none;
    }
`;

const NavLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    border-radius: 10px;
    position: relative;
    transition: all 0.3s ease;
    background: ${props => props.$active ? 'rgba(0, 173, 237, 0.15)' : 'transparent'};
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.3)' : 'transparent'};

    &:hover {
        color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: translateY(-2px);
    }

    &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translateX(-50%);
        width: ${props => props.$active ? '60%' : '0'};
        height: 2px;
        background: linear-gradient(90deg, #00adef, #00ff88);
        border-radius: 2px;
        transition: width 0.3s ease;
    }

    &:hover::after {
        width: 60%;
    }
`;

// ============ USER MENU ============
const UserSection = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        gap: 0.5rem;
    }
`;

const NotificationButton = styled.button`
    position: relative;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    color: #00adef;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 173, 237, 0.3);
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

const UserMenuButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.15) 0%, rgba(0, 173, 237, 0.05) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.25) 0%, rgba(0, 173, 237, 0.1) 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 173, 237, 0.3);
    }

    @media (max-width: 768px) {
        padding: 0.5rem;
        gap: 0;
    }
`;

const UserAvatar = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1rem;
    color: white;
    box-shadow: 0 2px 10px rgba(0, 173, 237, 0.4);
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

// ============ DROPDOWN MENU ============
const DropdownMenu = styled.div`
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: rgba(15, 23, 42, 0.98);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
    min-width: 220px;
    overflow: hidden;
    animation: ${slideDown} 0.3s ease-out;
    z-index: 1001;
`;

const DropdownItem = styled.button`
    width: 100%;
    padding: 0.75rem 1.25rem;
    background: transparent;
    border: none;
    color: #e0e6ed;
    text-align: left;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: rgba(0, 173, 237, 0.15);
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
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    color: #00adef;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
    }

    @media (max-width: 768px) {
        display: flex;
    }
`;

const MobileMenu = styled.div`
    display: none;
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 14, 39, 0.98);
    backdrop-filter: blur(20px);
    z-index: 999;
    animation: ${fadeIn} 0.3s ease-out;
    overflow-y: auto;

    @media (max-width: 768px) {
        display: ${props => props.$open ? 'block' : 'none'};
    }
`;

const MobileNavLinks = styled.div`
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const MobileNavLink = styled(Link)`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    border-radius: 12px;
    background: ${props => props.$active ? 'rgba(0, 173, 237, 0.15)' : 'transparent'};
    border: 1px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.3)' : 'transparent'};
    transition: all 0.2s ease;

    &:hover {
        color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        border-color: rgba(0, 173, 237, 0.3);
        transform: translateX(5px);
    }
`;

const Divider = styled.div`
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 173, 237, 0.3), transparent);
    margin: 1rem 0;
`;

// ============ COMPONENT ============
const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/portfolio', label: 'Portfolio', icon: PieChart },
        { path: '/watchlist', label: 'Watchlist', icon: Eye },
        { path: '/predict', label: 'AI Predict', icon: Brain },
        { path: '/chat', label: 'AI Chat', icon: MessageSquare },
        { path: '/pricing', label: 'Pricing', icon: DollarSign },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
        setDropdownOpen(false);
        setMobileMenuOpen(false);
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

    useEffect(() => {
        // Close mobile menu when route changes
        setMobileMenuOpen(false);
        setDropdownOpen(false);
    }, [location]);

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
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                $active={location.pathname === item.path}
                            >
                                <Icon size={18} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </NavLinks>

                {/* USER SECTION */}
                <UserSection>
                    <NotificationButton>
                        <Bell size={20} />
                        <NotificationBadge>3</NotificationBadge>
                    </NotificationButton>

                    <div style={{ position: 'relative' }}>
                        <UserMenuButton onClick={() => setDropdownOpen(!dropdownOpen)}>
                            <UserAvatar>{getUserInitials()}</UserAvatar>
                            <UserName>{user?.name || 'User'}</UserName>
                            <DropdownIcon size={18} $open={dropdownOpen} />
                        </UserMenuButton>

                        {dropdownOpen && (
                            <DropdownMenu>
                                <DropdownItem onClick={() => {
                                    navigate('/profile');
                                    setDropdownOpen(false);
                                }}>
                                    <User size={18} />
                                    Profile
                                </DropdownItem>
                                <DropdownItem onClick={() => {
                                    navigate('/settings');
                                    setDropdownOpen(false);
                                }}>
                                    <Settings size={18} />
                                    Settings
                                </DropdownItem>
                                <DropdownItem className="danger" onClick={handleLogout}>
                                    <LogOut size={18} />
                                    Logout
                                </DropdownItem>
                            </DropdownMenu>
                        )}
                    </div>

                    <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </MobileMenuButton>
                </UserSection>
            </NavInner>

            {/* MOBILE MENU */}
            <MobileMenu $open={mobileMenuOpen}>
                <MobileNavLinks>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <MobileNavLink
                                key={item.path}
                                to={item.path}
                                $active={location.pathname === item.path}
                            >
                                <Icon size={24} />
                                {item.label}
                            </MobileNavLink>
                        );
                    })}
                    <Divider />
                    <MobileNavLink to="/profile">
                        <User size={24} />
                        Profile
                    </MobileNavLink>
                    <MobileNavLink to="/settings">
                        <Settings size={24} />
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
                        <LogOut size={24} />
                        Logout
                    </MobileNavLink>
                </MobileNavLinks>
            </MobileMenu>
        </NavContainer>
    );
};

export default Navbar;