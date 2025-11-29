// client/src/pages/VaultPage.js - NEXUS VAULT SHOP - FULLY THEMED
// Browse, Purchase, and Equip: Avatar Borders, Profile Themes, Badges, and Perks

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css, useTheme as useStyledTheme } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { useToast } from '../context/ToastContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import {
    Store, Sparkles, Crown, Shield, Palette, Award, Zap,
    Lock, Check, ChevronRight, Star, Diamond, Gem,
    ShoppingCart, Package, Gift, TrendingUp, Coins,
    CircleDollarSign, BadgeCheck, Frame, Paintbrush,
    Flame, Target, Brain, Wallet, X, Eye, Info
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.4); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.8); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const rainbow = keyframes`
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
`;

const legendaryGlow = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(245, 158, 11, 0.3);
    }
    50% { 
        box-shadow: 0 0 40px rgba(251, 191, 36, 0.8), 0 0 60px rgba(245, 158, 11, 0.5);
    }
`;

const epicGlow = keyframes`
    0%, 100% { 
        box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
    }
    50% { 
        box-shadow: 0 0 30px rgba(139, 92, 246, 0.7);
    }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: ${({ theme }) => theme.bg?.page || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)'};
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    padding: 2rem;
    padding-top: 100px;
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
        background: ${({ theme }) => `radial-gradient(circle, ${theme.warning || '#fbbf24'}66 0%, transparent 70%)`};
        top: 10%;
        left: -100px;
    }
    
    &:nth-child(2) {
        width: 300px;
        height: 300px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.accent || '#8b5cf6'}66 0%, transparent 70%)`};
        top: 50%;
        right: -50px;
        animation-delay: -5s;
    }
    
    &:nth-child(3) {
        width: 350px;
        height: 350px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.primary || '#00adef'}4D 0%, transparent 70%)`};
        bottom: 10%;
        left: 30%;
        animation-delay: -10s;
    }
`;

const ContentWrapper = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)'};
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 3s linear infinite;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const CoinBalance = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.warning || '#fbbf24'}33 0%, ${theme.warning || '#f59e0b'}1A 100%)`};
    border: 2px solid ${({ theme }) => `${theme.warning || '#fbbf24'}80`};
    border-radius: 50px;
    animation: ${glow} 3s ease-in-out infinite;
`;

const CoinIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.warning || '#fbbf24'} 0%, ${theme.warning || '#f59e0b'} 100%)`};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${float} 2s ease-in-out infinite;
`;

const CoinAmount = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    color: ${({ theme }) => theme.warning || '#fbbf24'};
`;

const CoinLabel = styled.div`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-weight: 600;
`;

// Category Tabs
const CategoryTabs = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    animation: ${fadeIn} 0.8s ease-out 0.2s backwards;
`;

const CategoryTab = styled.button`
    padding: 1rem 2rem;
    background: ${({ $active, theme }) => $active 
        ? `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}4D 0%, ${theme.brand?.accent || '#8b5cf6'}33 100%)`
        : theme.bg?.card || 'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${({ $active, theme }) => $active ? `${theme.brand?.primary || '#00adef'}99` : theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#00adef' : theme.text?.secondary || '#94a3b8'};
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}33 0%, ${theme.brand?.accent || '#8b5cf6'}26 100%)`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
        transform: translateY(-3px);
    }

    ${props => props.$active && css`
        box-shadow: ${({ theme }) => `0 5px 20px ${theme.brand?.primary || '#00adef'}4D`};
    `}
`;

const TabCount = styled.span`
    background: ${({ $active, theme }) => $active ? `${theme.brand?.primary || '#00adef'}4D` : theme.border?.secondary || 'rgba(100, 116, 139, 0.2)'};
    padding: 0.2rem 0.5rem;
    border-radius: 8px;
    font-size: 0.8rem;
`;

// Filter Bar
const FilterBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem 1.5rem;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    border-radius: 12px;
    flex-wrap: wrap;
    gap: 1rem;
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const FilterLabel = styled.span`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    font-weight: 600;
`;

const FilterButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${({ $active, theme }) => $active ? `${theme.brand?.primary || '#00adef'}33` : 'transparent'};
    border: 1px solid ${({ $active, theme }) => $active ? `${theme.brand?.primary || '#00adef'}80` : theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 8px;
    color: ${({ $active, theme }) => $active ? theme.brand?.primary || '#00adef' : theme.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}26`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}66`};
        color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    }
`;

// Items Grid
const ItemsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

// Item Card
const ItemCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'};
    border: 2px solid ${({ $equipped, $rarity, theme }) => {
        if ($equipped) return `${theme.success || '#10b981'}99`;
        if ($rarity === 'legendary') return `${theme.warning || '#fbbf24'}80`;
        if ($rarity === 'epic') return `${theme.brand?.accent || '#8b5cf6'}80`;
        if ($rarity === 'rare') return `${theme.info || '#3b82f6'}80`;
        return theme.border?.primary || 'rgba(100, 116, 139, 0.3)';
    }};
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    position: relative;
    opacity: ${props => props.$locked ? 0.6 : 1};

    ${props => props.$rarity === 'legendary' && !props.$locked && css`
        animation: ${legendaryGlow} 3s ease-in-out infinite;
    `}

    ${props => props.$rarity === 'epic' && !props.$locked && css`
        animation: ${epicGlow} 3s ease-in-out infinite;
    `}

    &:hover {
        transform: ${props => props.$locked ? 'none' : 'translateY(-8px)'};
        box-shadow: ${props => props.$locked ? 'none' : '0 20px 40px rgba(0, 0, 0, 0.3)'};
    }
`;

const ItemRarityBanner = styled.div`
    height: 4px;
    background: ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return `linear-gradient(90deg, ${theme.warning || '#fbbf24'}, ${theme.warning || '#f59e0b'}, ${theme.warning || '#fbbf24'})`;
        if ($rarity === 'epic') return `linear-gradient(90deg, ${theme.brand?.accent || '#8b5cf6'}, ${theme.brand?.accent || '#a78bfa'}, ${theme.brand?.accent || '#8b5cf6'})`;
        if ($rarity === 'rare') return `linear-gradient(90deg, ${theme.info || '#3b82f6'}, ${theme.info || '#60a5fa'}, ${theme.info || '#3b82f6'})`;
        return `linear-gradient(90deg, ${theme.text?.tertiary || '#64748b'}, ${theme.text?.secondary || '#94a3b8'}, ${theme.text?.tertiary || '#64748b'})`;
    }};
    background-size: 200% 100%;
    animation: ${shimmer} 2s linear infinite;
`;

const ItemPreview = styled.div`
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: ${({ $background, theme }) => $background || `${theme.brand?.primary || '#00adef'}0D`};
    overflow: hidden;
`;

const BorderPreview = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${props => props.$gradient || 'linear-gradient(135deg, #00adef, #0088cc)'};
    padding: 4px;
    box-shadow: 0 0 20px ${props => props.$glowColor || 'rgba(0, 173, 237, 0.5)'};
    
    ${props => props.$animation === 'shimmer' && css`
        animation: ${shimmer} 2s linear infinite;
        background-size: 200% 200%;
    `}
    
    ${props => props.$animation === 'pulse-glow' && css`
        animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const BorderInner = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${({ theme }) => theme.bg?.page || 'linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
`;

const ThemePreview = styled.div`
    width: 90%;
    height: 90%;
    border-radius: 12px;
    background: ${props => props.$background};
    border: 2px solid ${props => props.$primary};
    display: flex;
    flex-direction: column;
    padding: 0.75rem;
    gap: 0.5rem;
`;

const ThemeBar = styled.div`
    height: 8px;
    border-radius: 4px;
    background: ${props => props.$color};
    width: ${props => props.$width || '100%'};
`;

const BadgePreview = styled.div`
    font-size: 4rem;
    animation: ${float} 3s ease-in-out infinite;
    filter: ${props => props.$locked ? 'grayscale(100%)' : 'none'};
`;

const PerkPreview = styled.div`
    font-size: 3.5rem;
    animation: ${pulse} 2s ease-in-out infinite;
    filter: ${props => props.$locked ? 'grayscale(100%)' : 'none'};
`;

const ItemContent = styled.div`
    padding: 1.25rem;
`;

const ItemHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.75rem;
`;

const ItemName = styled.h3`
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    margin: 0;
`;

const RarityBadge = styled.span`
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return `${theme.warning || '#fbbf24'}33`;
        if ($rarity === 'epic') return `${theme.brand?.accent || '#8b5cf6'}33`;
        if ($rarity === 'rare') return `${theme.info || '#3b82f6'}33`;
        return `${theme.text?.tertiary || '#64748b'}33`;
    }};
    color: ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return theme.warning || '#fbbf24';
        if ($rarity === 'epic') return theme.brand?.accent || '#a78bfa';
        if ($rarity === 'rare') return theme.info || '#60a5fa';
        return theme.text?.secondary || '#94a3b8';
    }};
    border: 1px solid ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return `${theme.warning || '#fbbf24'}66`;
        if ($rarity === 'epic') return `${theme.brand?.accent || '#8b5cf6'}66`;
        if ($rarity === 'rare') return `${theme.info || '#3b82f6'}66`;
        return theme.border?.primary || 'rgba(100, 116, 139, 0.3)';
    }};
`;

const ItemDescription = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 0.9rem;
    margin-bottom: 1rem;
    line-height: 1.4;
    min-height: 40px;
`;

const ItemEffect = styled.div`
    padding: 0.75rem;
    background: ${({ theme }) => `${theme.success || '#10b981'}1A`};
    border: 1px solid ${({ theme }) => `${theme.success || '#10b981'}4D`};
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.success || '#10b981'};
    font-size: 0.85rem;
    font-weight: 600;
`;

const ItemRequirement = styled.div`
    padding: 0.6rem;
    background: ${({ theme }) => `${theme.error || '#ef4444'}1A`};
    border: 1px solid ${({ theme }) => `${theme.error || '#ef4444'}4D`};
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.error || '#f87171'};
    font-size: 0.8rem;
    font-weight: 600;
`;

const ItemFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
`;

const ItemPrice = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PriceIcon = styled.div`
    width: 24px;
    height: 24px;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.warning || '#fbbf24'} 0%, ${theme.warning || '#f59e0b'} 100%)`};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
`;

const PriceValue = styled.span`
    font-size: 1.2rem;
    font-weight: 900;
    color: ${({ $canAfford, theme }) => $canAfford ? theme.warning || '#fbbf24' : theme.error || '#ef4444'};
`;

const PriceFree = styled.span`
    font-size: 1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.success || '#10b981'};
`;

const ActionButton = styled.button`
    padding: 0.6rem 1.25rem;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.4rem;

    ${({ $variant, theme }) => $variant === 'purchase' && css`
        background: linear-gradient(135deg, ${theme.warning || '#fbbf24'} 0%, ${theme.warning || '#f59e0b'} 100%);
        border: none;
        color: #0a0e27;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px ${theme.warning || '#fbbf24'}66;
        }
    `}

    ${({ $variant, theme }) => $variant === 'equip' && css`
        background: linear-gradient(135deg, ${theme.success || '#10b981'} 0%, ${theme.success || '#059669'} 100%);
        border: none;
        color: white;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px ${theme.success || '#10b981'}66;
        }
    `}

    ${({ $variant, theme }) => $variant === 'equipped' && css`
        background: ${theme.success || '#10b981'}33;
        border: 2px solid ${theme.success || '#10b981'}80;
        color: ${theme.success || '#10b981'};
        cursor: default;
    `}

    ${({ $variant, theme }) => $variant === 'unequip' && css`
        background: ${theme.error || '#ef4444'}33;
        border: 2px solid ${theme.error || '#ef4444'}66;
        color: ${theme.error || '#f87171'};

        &:hover:not(:disabled) {
            background: ${theme.error || '#ef4444'}4D;
        }
    `}

    ${({ $variant, theme }) => $variant === 'locked' && css`
        background: ${theme.text?.tertiary || '#64748b'}33;
        border: 2px solid ${theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
        color: ${theme.text?.tertiary || '#64748b'};
        cursor: not-allowed;
    `}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const EquippedBadge = styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.4rem 0.75rem;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.success || '#10b981'} 0%, ${theme.success || '#059669'} 100%)`};
    border-radius: 20px;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    z-index: 10;
`;

const OwnedBadge = styled.div`
    position: absolute;
    top: 1rem;
    left: 1rem;
    padding: 0.4rem 0.75rem;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}66`};
    border-radius: 20px;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    z-index: 10;
`;

const LockedOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
`;

const LockIcon = styled.div`
    width: 60px;
    height: 60px;
    background: ${({ theme }) => `${theme.text?.tertiary || '#64748b'}4D`};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
`;

// Modal
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)'};
    border: 2px solid ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return `${theme.warning || '#fbbf24'}80`;
        if ($rarity === 'epic') return `${theme.brand?.accent || '#8b5cf6'}80`;
        if ($rarity === 'rare') return `${theme.info || '#3b82f6'}80`;
        return `${theme.brand?.primary || '#00adef'}80`;
    }};
    border-radius: 20px;
    padding: 2rem;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: ${fadeIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const CloseButton = styled.button`
    width: 40px;
    height: 40px;
    background: ${({ theme }) => `${theme.error || '#ef4444'}33`};
    border: 1px solid ${({ theme }) => `${theme.error || '#ef4444'}66`};
    border-radius: 10px;
    color: ${({ theme }) => theme.error || '#f87171'};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: ${({ theme }) => `${theme.error || '#ef4444'}4D`};
        transform: scale(1.05);
    }
`;

const ModalPreview = styled.div`
    height: 180px;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}0D`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
`;

const ModalDescription = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
`;

const ModalDetails = styled.div`
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}0D`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.5rem;
`;

const DetailRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};

    &:last-child {
        border-bottom: none;
    }
`;

const DetailLabel = styled.span`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 0.9rem;
`;

const DetailValue = styled.span`
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-weight: 600;
`;

const ModalActions = styled.div`
    display: flex;
    gap: 1rem;
`;

const ModalButton = styled.button`
    flex: 1;
    padding: 1rem;
    border-radius: 12px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    ${({ $primary, theme }) => $primary && css`
        background: linear-gradient(135deg, ${theme.warning || '#fbbf24'} 0%, ${theme.warning || '#f59e0b'} 100%);
        border: none;
        color: #0a0e27;

        &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px ${theme.warning || '#fbbf24'}66;
        }
    `}

    ${({ $secondary, theme }) => $secondary && css`
        background: ${theme.text?.tertiary || '#64748b'}33;
        border: 2px solid ${theme.border?.primary || 'rgba(100, 116, 139, 0.4)'};
        color: ${theme.text?.secondary || '#94a3b8'};

        &:hover {
            background: ${theme.text?.tertiary || '#64748b'}4D;
        }
    `}

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// Empty State
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
`;

const EmptyIcon = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${float} 3s ease-in-out infinite;
`;

// Loading Spinner
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1rem;
`;

const Spinner = styled.div`
    animation: ${spin} 1s linear infinite;
`;

// Stats Bar
const StatsBar = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.8s ease-out 0.1s backwards;
`;

const StatCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatIcon = styled.div`
    width: 50px;
    height: 50px;
    background: ${props => props.$bg || 'rgba(0, 173, 237, 0.2)'};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#00adef'};
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
`;

const StatLabel = styled.div`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
`;

// ============ MAIN COMPONENT ============
const VaultPage = () => {
    const { api, user } = useAuth();
    const { gamificationData, refreshGamification } = useGamification();
    const toast = useToast();
    const { setProfileTheme, profileThemeId } = useThemeContext();
    const theme = useStyledTheme();

    // State
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState({
        avatarBorders: [],
        perks: [],
        profileThemes: [],
        badges: []
    });
    const [userCoins, setUserCoins] = useState(0);
    const [userLevel, setUserLevel] = useState(1);
    const [equipped, setEquipped] = useState({});
    const [activeCategory, setActiveCategory] = useState('avatarBorders');
    const [filter, setFilter] = useState('all');
    const [rarityFilter, setRarityFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);
    const [purchasing, setPurchasing] = useState(false);

    // Sync with GamificationContext
    useEffect(() => {
        if (gamificationData) {
            setUserCoins(gamificationData.nexusCoins || 0);
            setUserLevel(gamificationData.level || 1);
            console.log('[VaultPage] Synced from GamificationContext:', {
                coins: gamificationData.nexusCoins,
                level: gamificationData.level
            });
        }
    }, [gamificationData]);

    // Categories config
    const categories = [
        { id: 'avatarBorders', label: 'Borders', icon: Frame },
        { id: 'profileThemes', label: 'Themes', icon: Palette },
        { id: 'badges', label: 'Badges', icon: Award },
        { id: 'perks', label: 'Perks', icon: Zap }
    ];

    // Load vault data
    useEffect(() => {
        if (user) {
            fetchVaultData();
        }
    }, [user]);

    const fetchVaultData = async () => {
        try {
            setLoading(true);
            console.log('[VaultPage] Fetching vault items...');
            
            const response = await api.get('/vault/items');
            console.log('[VaultPage] API Response:', response.data);
            
            if (response.data.success) {
                setItems({
                    avatarBorders: response.data.items?.avatarBorders || [],
                    perks: response.data.items?.perks || [],
                    profileThemes: response.data.items?.profileThemes || [],
                    badges: response.data.items?.badges || []
                });
                
                setEquipped(response.data.vault || {
                    equippedBorder: 'border-bronze',
                    equippedTheme: 'theme-default',
                    equippedBadges: [],
                    activePerks: []
                });
                
                console.log('[VaultPage] Items loaded successfully');
            } else {
                console.error('[VaultPage] API returned success: false');
                toast.error('Failed to load vault data', 'Error');
            }
        } catch (error) {
            console.error('[VaultPage] Error fetching vault:', error);
            console.error('[VaultPage] Error details:', error.response?.data);
            toast.error(error.response?.data?.error || 'Failed to load vault', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (item) => {
        if (purchasing) return;
        
        setPurchasing(true);
        try {
            const response = await api.post(`/vault/purchase/${item.id}`);
            
            if (response.data.success) {
                toast.success(response.data.message, '🎉 Purchased!');
                
                setItems(prev => {
                    const category = Object.keys(prev).find(cat => 
                        prev[cat].some(i => i.id === item.id)
                    );
                    if (!category) return prev;
                    
                    return {
                        ...prev,
                        [category]: prev[category].map(i => 
                            i.id === item.id ? { ...i, owned: true, canAfford: true } : i
                        )
                    };
                });
                
                if (refreshGamification) {
                    await refreshGamification();
                }
                
                setSelectedItem(null);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            toast.error(error.response?.data?.error || 'Purchase failed', 'Error');
        } finally {
            setPurchasing(false);
        }
    };

    const handleEquip = async (item) => {
        try {
            const response = await api.post(`/vault/equip/${item.id}`);
            
            if (response.data.success) {
                toast.success(response.data.message, '✅ Equipped!');
                setEquipped(response.data.equipped);
                
                // Update local theme immediately if it's a theme
                if (item.type === 'profile-theme') {
                    setProfileTheme(item.id);
                    console.log('🎨 Theme updated locally:', item.id);
                }
                
                fetchVaultData();
            }
        } catch (error) {
            console.error('Equip error:', error);
            toast.error(error.response?.data?.error || 'Failed to equip', 'Error');
        }
    };

    const handleUnequip = async (item) => {
        try {
            const response = await api.post(`/vault/unequip/${item.id}`);
            
            if (response.data.success) {
                toast.success(response.data.message, 'Unequipped');
                setEquipped(response.data.equipped);
                fetchVaultData();
            }
        } catch (error) {
            console.error('Unequip error:', error);
            toast.error(error.response?.data?.error || 'Failed to unequip', 'Error');
        }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    const getFilteredItems = () => {
        let filtered = items[activeCategory] || [];
        
        if (filter === 'owned') {
            filtered = filtered.filter(item => item.owned);
        } else if (filter === 'locked') {
            filtered = filtered.filter(item => !item.canUnlock);
        }
        
        if (rarityFilter !== 'all') {
            filtered = filtered.filter(item => item.rarity === rarityFilter);
        }
        
        return filtered;
    };

    const getOwnedCount = (category) => {
        return (items[category] || []).filter(item => item.owned).length;
    };

    const getTotalCount = (category) => {
        return (items[category] || []).length;
    };

    const isItemEquipped = (item) => {
        if (item.type === 'avatar-border') return equipped.equippedBorder === item.id;
        if (item.type === 'profile-theme') return equipped.equippedTheme === item.id;
        if (item.type === 'badge') return (equipped.equippedBadges || []).includes(item.id);
        if (item.type === 'perk') return (equipped.activePerks || []).includes(item.id);
        return false;
    };

    const renderItemPreview = (item, large = false) => {
        const size = large ? '120px' : '80px';
        const fontSize = large ? '5rem' : '3.5rem';
        
        switch (item.type) {
            case 'avatar-border':
                return (
                    <BorderPreview 
                        $gradient={item.gradient} 
                        $glowColor={item.glowColor}
                        $animation={item.animation}
                        style={{ width: size, height: size }}
                    >
                        <BorderInner>
                            <Crown size={large ? 40 : 28} color={theme?.warning || '#fbbf24'} />
                        </BorderInner>
                    </BorderPreview>
                );
            case 'profile-theme':
                return (
                    <ThemePreview 
                        $background={item.colors?.background}
                        $primary={item.colors?.primary}
                        style={{ maxWidth: large ? '200px' : '150px' }}
                    >
                        <ThemeBar $color={item.colors?.primary} $width="70%" />
                        <ThemeBar $color={item.colors?.secondary} $width="50%" />
                        <ThemeBar $color={item.colors?.accent} $width="85%" />
                    </ThemePreview>
                );
            case 'badge':
                return (
                    <BadgePreview 
                        $locked={!item.canUnlock && !item.owned}
                        style={{ fontSize }}
                    >
                        {item.icon}
                    </BadgePreview>
                );
            case 'perk':
                return (
                    <PerkPreview 
                        $locked={!item.canUnlock && !item.owned}
                        style={{ fontSize }}
                    >
                        {item.icon}
                    </PerkPreview>
                );
            default:
                return <Diamond size={40} />;
        }
    };

    const renderActionButton = (item) => {
        const isEquipped = isItemEquipped(item);
        
        if (!item.canUnlock && !item.owned) {
            return (
                <ActionButton $variant="locked" disabled>
                    <Lock size={16} />
                    Locked
                </ActionButton>
            );
        }
        
        if (!item.owned) {
            if (item.cost === 0) {
                return (
                    <ActionButton $variant="equip" onClick={() => handleEquip(item)}>
                        <Check size={16} />
                        Claim Free
                    </ActionButton>
                );
            }
            return (
                <ActionButton 
                    $variant="purchase" 
                    onClick={() => setSelectedItem(item)}
                    disabled={!item.canAfford}
                >
                    <ShoppingCart size={16} />
                    Buy
                </ActionButton>
            );
        }
        
        if (isEquipped) {
            if (item.type === 'badge' || item.type === 'perk') {
                return (
                    <ActionButton $variant="unequip" onClick={() => handleUnequip(item)}>
                        <X size={16} />
                        Unequip
                    </ActionButton>
                );
            }
            return (
                <ActionButton $variant="equipped">
                    <Check size={16} />
                    Equipped
                </ActionButton>
            );
        }
        
        return (
            <ActionButton $variant="equip" onClick={() => handleEquip(item)}>
                <Check size={16} />
                Equip
            </ActionButton>
        );
    };

    const getRequirementText = (req) => {
        if (!req) return null;
        
        switch (req.type) {
            case 'level':
                return `Requires Level ${req.value}`;
            case 'stats':
                return `Requires ${req.stat}: ${formatNumber(req.value)}`;
            case 'special':
                return `Special: ${req.value}`;
            default:
                return 'Special requirement';
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <BackgroundOrbs>
                    <Orb $duration="25s" />
                    <Orb $duration="30s" />
                    <Orb $duration="20s" />
                </BackgroundOrbs>
                <LoadingContainer>
                    <Spinner>
                        <Store size={64} color={theme?.warning || '#fbbf24'} />
                    </Spinner>
                    <h2 style={{ color: theme?.warning || '#fbbf24' }}>Loading Vault...</h2>
                </LoadingContainer>
            </PageContainer>
        );
    }

    const filteredItems = getFilteredItems();
    const totalOwned = Object.values(items).flat().filter(i => i.owned).length;
    const totalItems = Object.values(items).flat().length;

    return (
        <PageContainer>
            <BackgroundOrbs>
                <Orb $duration="25s" />
                <Orb $duration="30s" />
                <Orb $duration="20s" />
            </BackgroundOrbs>

            <ContentWrapper>
                <Header>
                    <Title>
                        <Store size={56} />
                        Nexus Vault
                    </Title>
                    <Subtitle>
                        Customize your profile with exclusive borders, themes, badges, and perks
                    </Subtitle>
                    <CoinBalance>
                        <CoinIcon>
                            <Coins size={20} color="#0a0e27" />
                        </CoinIcon>
                        <div>
                            <CoinAmount>{formatNumber(userCoins)}</CoinAmount>
                            <CoinLabel>Nexus Coins</CoinLabel>
                        </div>
                    </CoinBalance>
                </Header>

                <StatsBar>
                    <StatCard>
                        <StatIcon $bg={`${theme?.warning || '#fbbf24'}33`} $color={theme?.warning || '#fbbf24'}>
                            <Package size={24} />
                        </StatIcon>
                        <StatInfo>
                            <StatValue>{totalOwned}/{totalItems}</StatValue>
                            <StatLabel>Items Owned</StatLabel>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon $bg={`${theme?.brand?.accent || '#8b5cf6'}33`} $color={theme?.brand?.accent || '#a78bfa'}>
                            <TrendingUp size={24} />
                        </StatIcon>
                        <StatInfo>
                            <StatValue>Level {userLevel}</StatValue>
                            <StatLabel>Your Level</StatLabel>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon $bg={`${theme?.success || '#10b981'}33`} $color={theme?.success || '#10b981'}>
                            <BadgeCheck size={24} />
                        </StatIcon>
                        <StatInfo>
                            <StatValue>{((totalOwned / totalItems) * 100).toFixed(0)}%</StatValue>
                            <StatLabel>Collection</StatLabel>
                        </StatInfo>
                    </StatCard>
                    <StatCard>
                        <StatIcon $bg={`${theme?.error || '#ef4444'}33`} $color={theme?.error || '#f87171'}>
                            <Gem size={24} />
                        </StatIcon>
                        <StatInfo>
                            <StatValue>
                                {Object.values(items).flat().filter(i => i.rarity === 'legendary' && i.owned).length}
                            </StatValue>
                            <StatLabel>Legendaries</StatLabel>
                        </StatInfo>
                    </StatCard>
                </StatsBar>

                <CategoryTabs>
                    {categories.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <CategoryTab
                                key={cat.id}
                                $active={activeCategory === cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                <Icon size={20} />
                                {cat.label}
                                <TabCount $active={activeCategory === cat.id}>
                                    {getOwnedCount(cat.id)}/{getTotalCount(cat.id)}
                                </TabCount>
                            </CategoryTab>
                        );
                    })}
                </CategoryTabs>

                <FilterBar>
                    <FilterGroup>
                        <FilterLabel>Status:</FilterLabel>
                        <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>
                            All
                        </FilterButton>
                        <FilterButton $active={filter === 'owned'} onClick={() => setFilter('owned')}>
                            Owned
                        </FilterButton>
                        <FilterButton $active={filter === 'locked'} onClick={() => setFilter('locked')}>
                            Locked
                        </FilterButton>
                    </FilterGroup>
                    <FilterGroup>
                        <FilterLabel>Rarity:</FilterLabel>
                        <FilterButton $active={rarityFilter === 'all'} onClick={() => setRarityFilter('all')}>
                            All
                        </FilterButton>
                        <FilterButton $active={rarityFilter === 'common'} onClick={() => setRarityFilter('common')}>
                            Common
                        </FilterButton>
                        <FilterButton $active={rarityFilter === 'rare'} onClick={() => setRarityFilter('rare')}>
                            Rare
                        </FilterButton>
                        <FilterButton $active={rarityFilter === 'epic'} onClick={() => setRarityFilter('epic')}>
                            Epic
                        </FilterButton>
                        <FilterButton $active={rarityFilter === 'legendary'} onClick={() => setRarityFilter('legendary')}>
                            Legendary
                        </FilterButton>
                    </FilterGroup>
                </FilterBar>

                {filteredItems.length > 0 ? (
                    <ItemsGrid>
                        {filteredItems.map(item => {
                            const isLocked = !item.canUnlock && !item.owned;
                            const isEquipped = isItemEquipped(item);
                            
                            return (
                                <ItemCard 
                                    key={item.id} 
                                    $rarity={item.rarity}
                                    $locked={isLocked}
                                    $equipped={isEquipped}
                                >
                                    <ItemRarityBanner $rarity={item.rarity} />
                                    
                                    {isEquipped && (
                                        <EquippedBadge>
                                            <Check size={12} />
                                            Equipped
                                        </EquippedBadge>
                                    )}
                                    
                                    {item.owned && !isEquipped && (
                                        <OwnedBadge>
                                            <Package size={12} />
                                            Owned
                                        </OwnedBadge>
                                    )}
                                    
                                    <ItemPreview $background={item.colors?.background}>
                                        {isLocked && (
                                            <LockedOverlay>
                                                <LockIcon>
                                                    <Lock size={30} />
                                                </LockIcon>
                                            </LockedOverlay>
                                        )}
                                        {renderItemPreview(item)}
                                    </ItemPreview>
                                    
                                    <ItemContent>
                                        <ItemHeader>
                                            <ItemName>{item.name}</ItemName>
                                            <RarityBadge $rarity={item.rarity}>
                                                {item.rarity}
                                            </RarityBadge>
                                        </ItemHeader>
                                        
                                        <ItemDescription>{item.description}</ItemDescription>
                                        
                                        {item.effect && (
                                            <ItemEffect>
                                                <Zap size={14} />
                                                {item.effect.type === 'xp_bonus' && `+${item.effect.value * 100}% XP`}
                                                {item.effect.type === 'coin_bonus' && `+${item.effect.value * 100}% Coins`}
                                                {item.effect.type === 'profit_bonus' && `+${item.effect.value * 100}% Profits`}
                                                {item.effect.type === 'streak_protection' && `${item.effect.value} day grace`}
                                                {item.effect.type === 'extra_daily' && `+${item.effect.value} daily challenge`}
                                            </ItemEffect>
                                        )}
                                        
                                        {isLocked && item.unlockRequirement && (
                                            <ItemRequirement>
                                                <Lock size={14} />
                                                {getRequirementText(item.unlockRequirement)}
                                            </ItemRequirement>
                                        )}
                                        
                                        <ItemFooter>
                                            <ItemPrice>
                                                {item.cost === 0 ? (
                                                    <PriceFree>FREE</PriceFree>
                                                ) : (
                                                    <>
                                                        <PriceIcon>
                                                            <Coins size={12} color="#0a0e27" />
                                                        </PriceIcon>
                                                        <PriceValue $canAfford={item.canAfford || item.owned}>
                                                            {formatNumber(item.cost)}
                                                        </PriceValue>
                                                    </>
                                                )}
                                            </ItemPrice>
                                            {renderActionButton(item)}
                                        </ItemFooter>
                                    </ItemContent>
                                </ItemCard>
                            );
                        })}
                    </ItemsGrid>
                ) : (
                    <EmptyState>
                        <EmptyIcon>
                            <Package size={50} color={theme?.text?.tertiary || '#64748b'} />
                        </EmptyIcon>
                        <h3 style={{ color: theme?.text?.secondary || '#94a3b8', marginBottom: '0.5rem' }}>No items found</h3>
                        <p>Try adjusting your filters</p>
                    </EmptyState>
                )}
            </ContentWrapper>

            {/* Purchase Confirmation Modal */}
            {selectedItem && (
                <ModalOverlay onClick={() => setSelectedItem(null)}>
                    <ModalContent 
                        $rarity={selectedItem.rarity}
                        onClick={e => e.stopPropagation()}
                    >
                        <ModalHeader>
                            <ModalTitle>
                                <ShoppingCart size={24} />
                                Confirm Purchase
                            </ModalTitle>
                            <CloseButton onClick={() => setSelectedItem(null)}>
                                <X size={20} />
                            </CloseButton>
                        </ModalHeader>
                        
                        <ModalPreview>
                            {renderItemPreview(selectedItem, true)}
                        </ModalPreview>
                        
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ color: theme?.text?.primary || '#e0e6ed', marginBottom: '0.5rem' }}>
                                {selectedItem.name}
                            </h3>
                            <RarityBadge $rarity={selectedItem.rarity} style={{ display: 'inline-block' }}>
                                {selectedItem.rarity}
                            </RarityBadge>
                        </div>
                        
                        <ModalDescription>{selectedItem.description}</ModalDescription>
                        
                        {selectedItem.effect && (
                            <ItemEffect style={{ marginBottom: '1.5rem' }}>
                                <Zap size={16} />
                                Effect: {selectedItem.effect.type === 'xp_bonus' && `+${selectedItem.effect.value * 100}% XP from all sources`}
                                {selectedItem.effect.type === 'coin_bonus' && `+${selectedItem.effect.value * 100}% Nexus Coins from activities`}
                                {selectedItem.effect.type === 'profit_bonus' && `+${selectedItem.effect.value * 100}% on profitable trades`}
                                {selectedItem.effect.type === 'streak_protection' && `${selectedItem.effect.value} day login streak protection`}
                                {selectedItem.effect.type === 'extra_daily' && `Complete ${selectedItem.effect.value} extra daily challenge`}
                            </ItemEffect>
                        )}
                        
                        <ModalDetails>
                            <DetailRow>
                                <DetailLabel>Item Cost</DetailLabel>
                                <DetailValue style={{ color: theme?.warning || '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Coins size={16} />
                                    {formatNumber(selectedItem.cost)}
                                </DetailValue>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabel>Your Balance</DetailLabel>
                                <DetailValue style={{ color: userCoins >= selectedItem.cost ? theme?.success || '#10b981' : theme?.error || '#ef4444' }}>
                                    {formatNumber(userCoins)} coins
                                </DetailValue>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabel>After Purchase</DetailLabel>
                                <DetailValue>
                                    {formatNumber(Math.max(0, userCoins - selectedItem.cost))} coins
                                </DetailValue>
                            </DetailRow>
                        </ModalDetails>
                        
                        <ModalActions>
                            <ModalButton $secondary onClick={() => setSelectedItem(null)}>
                                Cancel
                            </ModalButton>
                            <ModalButton 
                                $primary 
                                onClick={() => handlePurchase(selectedItem)}
                                disabled={purchasing || userCoins < selectedItem.cost}
                            >
                                {purchasing ? (
                                    <>
                                        <Spinner style={{ width: 20, height: 20 }}>
                                            <Store size={16} />
                                        </Spinner>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={18} />
                                        Purchase for {formatNumber(selectedItem.cost)}
                                    </>
                                )}
                            </ModalButton>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </PageContainer>
    );
};

export default VaultPage;