// client/src/context/ThemeContext.js - ENHANCED WITH ANIMATED BACKGROUNDS
// Epic and Legendary themes now have crazy animated background effects

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// ===== VAULT PROFILE THEMES WITH RARITY AND EFFECTS =====
const vaultThemes = {
    // ============ COMMON THEMES ============
    'theme-default': {
        id: 'theme-default',
        name: 'Default Theme',
        rarity: 'common',
        primary: '#00adef',
        secondary: '#0891b2',
        accent: '#06b6d4',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        pageBackground: 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(10, 14, 39, 0.98) 0%, rgba(10, 14, 39, 0.95) 100%)',
        effects: null
    },
    'theme-emerald': {
        id: 'theme-emerald',
        name: 'Emerald Dreams',
        rarity: 'common',
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #021a12 0%, #0a2920 50%, #021a12 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(2, 26, 18, 0.98) 0%, rgba(2, 26, 18, 0.95) 100%)',
        effects: null
    },
    'theme-crimson': {
        id: 'theme-crimson',
        name: 'Crimson Fire',
        rarity: 'common',
        primary: '#ef4444',
        secondary: '#dc2626',
        accent: '#f87171',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #1a0505 0%, #2d0a0a 50%, #1a0505 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(26, 5, 5, 0.98) 0%, rgba(26, 5, 5, 0.95) 100%)',
        effects: null
    },
    'theme-ocean': {
        id: 'theme-ocean',
        name: 'Ocean Depths',
        rarity: 'common',
        primary: '#0ea5e9',
        secondary: '#0284c7',
        accent: '#38bdf8',
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(2, 132, 199, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #021526 0%, #0a2540 50%, #021526 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(2, 21, 38, 0.98) 0%, rgba(2, 21, 38, 0.95) 100%)',
        effects: null
    },

    // ============ RARE THEMES ============
    'theme-forest': {
        id: 'theme-forest',
        name: 'Forest Canopy',
        rarity: 'rare',
        primary: '#22c55e',
        secondary: '#16a34a',
        accent: '#4ade80',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #051a0a 0%, #0d2914 50%, #051a0a 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(5, 26, 10, 0.98) 0%, rgba(5, 26, 10, 0.95) 100%)',
        effects: {
            type: 'particles',
            count: 15,
            colors: ['#22c55e', '#4ade80', '#86efac'],
            speed: 'slow',
            opacity: 0.3
        }
    },
    'theme-royal': {
        id: 'theme-royal',
        name: 'Royal Purple',
        rarity: 'rare',
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #0f0720 0%, #1a0f30 50%, #0f0720 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(15, 7, 32, 0.98) 0%, rgba(15, 7, 32, 0.95) 100%)',
        effects: {
            type: 'particles',
            count: 15,
            colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
            speed: 'slow',
            opacity: 0.3
        }
    },
    'theme-midnight': {
        id: 'theme-midnight',
        name: 'Midnight Shadow',
        rarity: 'rare',
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#818cf8',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #080820 0%, #101035 50%, #080820 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(8, 8, 32, 0.98) 0%, rgba(8, 8, 32, 0.95) 100%)',
        effects: {
            type: 'stars',
            count: 50,
            colors: ['#6366f1', '#818cf8', '#ffffff'],
            twinkle: true,
            opacity: 0.5
        }
    },
    'theme-sunset': {
        id: 'theme-sunset',
        name: 'Sunset Blaze',
        rarity: 'rare',
        primary: '#f59e0b',
        secondary: '#ec4899',
        accent: '#fb923c',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #1a0f05 0%, #2d1510 50%, #1a0f05 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(26, 15, 5, 0.98) 0%, rgba(26, 15, 5, 0.95) 100%)',
        effects: {
            type: 'gradient-shift',
            colors: ['#f59e0b', '#ec4899', '#f97316'],
            speed: 'medium',
            opacity: 0.2
        }
    },
    'theme-gold-rush': {
        id: 'theme-gold-rush',
        name: 'Gold Rush',
        rarity: 'rare',
        primary: '#fbbf24',
        secondary: '#f59e0b',
        accent: '#fcd34d',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
        pageBackground: 'linear-gradient(145deg, #1a1505 0%, #2d2008 50%, #1a1505 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(26, 21, 5, 0.98) 0%, rgba(26, 21, 5, 0.95) 100%)',
        effects: {
            type: 'particles',
            count: 20,
            colors: ['#fbbf24', '#fcd34d', '#fef3c7'],
            speed: 'slow',
            opacity: 0.4,
            sparkle: true
        }
    },

    // ============ EPIC THEMES ============
    'theme-aurora': {
        id: 'theme-aurora',
        name: 'Aurora Borealis',
        rarity: 'epic',
        primary: '#14b8a6',
        secondary: '#a855f7',
        accent: '#2dd4bf',
        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #021515 0%, #0a1a25 50%, #0f0a20 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(2, 21, 21, 0.98) 0%, rgba(2, 21, 21, 0.95) 100%)',
        effects: {
            type: 'aurora',
            colors: ['#14b8a6', '#a855f7', '#06b6d4', '#8b5cf6'],
            waves: 3,
            speed: 'slow',
            opacity: 0.4,
            blur: 60
        }
    },
    'theme-cyber': {
        id: 'theme-cyber',
        name: 'Cyberpunk Neon',
        rarity: 'epic',
        primary: '#06b6d4',
        secondary: '#d946ef',
        accent: '#22d3ee',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(217, 70, 239, 0.2) 100%)',
        pageBackground: 'linear-gradient(145deg, #05101a 0%, #100520 50%, #05101a 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(5, 16, 26, 0.98) 0%, rgba(5, 16, 26, 0.95) 100%)',
        effects: {
            type: 'matrix',
            colors: ['#06b6d4', '#d946ef', '#22d3ee'],
            density: 'medium',
            speed: 'fast',
            opacity: 0.3,
            glitch: true
        }
    },
    'theme-phoenix': {
        id: 'theme-phoenix',
        name: 'Phoenix Rising',
        rarity: 'epic',
        primary: '#f97316',
        secondary: '#ef4444',
        accent: '#fbbf24',
        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
        pageBackground: 'linear-gradient(145deg, #1a0805 0%, #2d0f08 50%, #1a0805 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(26, 8, 5, 0.98) 0%, rgba(26, 8, 5, 0.95) 100%)',
        effects: {
            type: 'flames',
            colors: ['#f97316', '#ef4444', '#fbbf24', '#fcd34d'],
            intensity: 'high',
            particles: 40,
            speed: 'medium',
            opacity: 0.35
        }
    },
    'theme-storm': {
        id: 'theme-storm',
        name: 'Electric Storm',
        rarity: 'epic',
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#60a5fa',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
        pageBackground: 'linear-gradient(145deg, #050a1a 0%, #0a1030 50%, #050a1a 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(5, 10, 26, 0.98) 0%, rgba(5, 10, 26, 0.95) 100%)',
        effects: {
            type: 'lightning',
            colors: ['#3b82f6', '#8b5cf6', '#60a5fa', '#c4b5fd'],
            bolts: 3,
            frequency: 'medium',
            opacity: 0.5,
            rain: true
        }
    },

    // ============ LEGENDARY THEMES ============
    'theme-cosmic': {
        id: 'theme-cosmic',
        name: 'Cosmic Void',
        rarity: 'legendary',
        primary: '#6366f1',
        secondary: '#0f172a',
        accent: '#a78bfa',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 6, 39, 0.95) 100%)',
        pageBackground: 'radial-gradient(ellipse at center, #0f0a25 0%, #020208 50%, #000005 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(2, 2, 8, 0.98) 0%, rgba(2, 2, 8, 0.95) 100%)',
        effects: {
            type: 'nebula',
            colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'],
            clouds: 5,
            stars: 100,
            shootingStars: true,
            speed: 'slow',
            opacity: 0.5,
            pulse: true
        }
    },
    'theme-void-walker': {
        id: 'theme-void-walker',
        name: 'Void Walker',
        rarity: 'legendary',
        primary: '#7c3aed',
        secondary: '#1e1b4b',
        accent: '#c4b5fd',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(30, 27, 75, 0.9) 100%)',
        pageBackground: 'radial-gradient(ellipse at 30% 20%, #1a0a30 0%, #0a0515 30%, #020105 70%, #000000 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(10, 5, 21, 0.98) 0%, rgba(2, 1, 5, 0.98) 100%)',
        effects: {
            type: 'void',
            colors: ['#7c3aed', '#c4b5fd', '#a855f7', '#6366f1'],
            vortex: true,
            particles: 60,
            distortion: true,
            speed: 'medium',
            opacity: 0.6,
            darkMatter: true
        }
    },
    'theme-celestial': {
        id: 'theme-celestial',
        name: 'Celestial Dawn',
        rarity: 'legendary',
        primary: '#fbbf24',
        secondary: '#f472b6',
        accent: '#fef3c7',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(244, 114, 182, 0.15) 100%)',
        pageBackground: 'radial-gradient(ellipse at top, #2d1f0a 0%, #1a0a15 30%, #0a0510 70%, #050208 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(26, 15, 8, 0.98) 0%, rgba(10, 5, 16, 0.95) 100%)',
        effects: {
            type: 'celestial',
            colors: ['#fbbf24', '#f472b6', '#fef3c7', '#fbcfe8', '#fde68a'],
            sunrays: true,
            particles: 50,
            halos: 3,
            speed: 'slow',
            opacity: 0.5,
            shimmer: true
        }
    },
    'theme-dragon': {
        id: 'theme-dragon',
        name: 'Dragon\'s Breath',
        rarity: 'legendary',
        primary: '#dc2626',
        secondary: '#fbbf24',
        accent: '#fb923c',
        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(251, 191, 36, 0.15) 100%)',
        pageBackground: 'radial-gradient(ellipse at bottom, #2d0a05 0%, #1a0805 40%, #0f0502 70%, #050200 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(26, 5, 2, 0.98) 0%, rgba(15, 5, 2, 0.95) 100%)',
        effects: {
            type: 'dragon',
            colors: ['#dc2626', '#fb923c', '#fbbf24', '#fef3c7'],
            flames: true,
            embers: 80,
            smoke: true,
            intensity: 'extreme',
            speed: 'fast',
            opacity: 0.55
        }
    },
    'theme-arctic': {
        id: 'theme-arctic',
        name: 'Arctic Frost',
        rarity: 'legendary',
        primary: '#06b6d4',
        secondary: '#a5f3fc',
        accent: '#67e8f9',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(165, 243, 252, 0.1) 100%)',
        pageBackground: 'radial-gradient(ellipse at top, #0a2530 0%, #051520 30%, #020a10 70%, #000508 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(5, 21, 32, 0.98) 0%, rgba(2, 10, 16, 0.95) 100%)',
        effects: {
            type: 'frost',
            colors: ['#06b6d4', '#67e8f9', '#a5f3fc', '#cffafe', '#ffffff'],
            snowflakes: 60,
            iceShards: true,
            frost: true,
            breathEffect: true,
            speed: 'slow',
            opacity: 0.5
        }
    }
};

// ===== AVATAR BORDER COLORS FOR EACH THEME =====
const avatarBorderColors = {
    // Common
    'theme-default': { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    'theme-emerald': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
    'theme-crimson': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
    'theme-ocean': { color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.5)' },
    // Rare
    'theme-forest': { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' },
    'theme-royal': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
    'theme-midnight': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.5)' },
    'theme-sunset': { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
    'theme-gold-rush': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
    // Epic
    'theme-aurora': { color: '#14b8a6', glow: 'rgba(20, 184, 166, 0.6)', animated: true },
    'theme-cyber': { color: '#06b6d4', glow: 'rgba(217, 70, 239, 0.6)', animated: true },
    'theme-phoenix': { color: '#f97316', glow: 'rgba(249, 115, 22, 0.6)', animated: true },
    'theme-storm': { color: '#3b82f6', glow: 'rgba(139, 92, 246, 0.6)', animated: true },
    // Legendary
    'theme-cosmic': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.7)', animated: true, rainbow: true },
    'theme-void-walker': { color: '#7c3aed', glow: 'rgba(124, 58, 237, 0.7)', animated: true, pulse: true },
    'theme-celestial': { color: '#fbbf24', glow: 'rgba(244, 114, 182, 0.7)', animated: true, shimmer: true },
    'theme-dragon': { color: '#dc2626', glow: 'rgba(251, 191, 36, 0.7)', animated: true, flames: true },
    'theme-arctic': { color: '#06b6d4', glow: 'rgba(103, 232, 249, 0.7)', animated: true, frost: true },
    // Without prefix variants
    'default': { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    'emerald': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
    'crimson': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
    'ocean': { color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.5)' },
    'forest': { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' },
    'royal': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
    'midnight': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.5)' },
    'sunset': { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
    'gold-rush': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
    'aurora': { color: '#14b8a6', glow: 'rgba(20, 184, 166, 0.6)', animated: true },
    'cyber': { color: '#06b6d4', glow: 'rgba(217, 70, 239, 0.6)', animated: true },
    'phoenix': { color: '#f97316', glow: 'rgba(249, 115, 22, 0.6)', animated: true },
    'storm': { color: '#3b82f6', glow: 'rgba(139, 92, 246, 0.6)', animated: true },
    'cosmic': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.7)', animated: true, rainbow: true },
    'void-walker': { color: '#7c3aed', glow: 'rgba(124, 58, 237, 0.7)', animated: true, pulse: true },
    'celestial': { color: '#fbbf24', glow: 'rgba(244, 114, 182, 0.7)', animated: true, shimmer: true },
    'dragon': { color: '#dc2626', glow: 'rgba(251, 191, 36, 0.7)', animated: true, flames: true },
    'arctic': { color: '#06b6d4', glow: 'rgba(103, 232, 249, 0.7)', animated: true, frost: true }
};

// ===== RARITY COLORS =====
const rarityColors = {
    common: { color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.3)', name: 'Common' },
    rare: { color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)', name: 'Rare' },
    epic: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.5)', name: 'Epic' },
    legendary: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.6)', name: 'Legendary' }
};

// ===== BUILD COMPLETE THEME OBJECT =====
const buildTheme = (baseMode, profileThemeId) => {
    const profileTheme = vaultThemes[profileThemeId] || vaultThemes['theme-default'];
    const borderColors = avatarBorderColors[profileThemeId] || avatarBorderColors['theme-default'];
    const rarity = rarityColors[profileTheme.rarity] || rarityColors.common;
    
    // Base dark theme structure
    const darkBase = {
        mode: 'dark',
        
        // Page backgrounds
        bg: {
            page: profileTheme.pageBackground || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
            card: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            cardSolid: 'rgba(15, 23, 42, 0.95)',
            cardHover: 'rgba(30, 41, 59, 0.95)',
            input: 'rgba(15, 23, 42, 0.8)',
            overlay: 'rgba(0, 0, 0, 0.8)',
            navbar: profileTheme.navbarBackground || 'linear-gradient(180deg, rgba(10, 14, 30, 0.98) 0%, rgba(10, 14, 30, 0.95) 100%)',
            dropdown: 'rgba(15, 23, 42, 0.98)',
            accent: profileTheme.background
        },
        
        // Text colors
        text: {
            primary: '#e0e6ed',
            secondary: '#94a3b8',
            tertiary: '#64748b',
            inverse: '#0f172a'
        },
        
        // Brand/accent colors from profile theme
        brand: {
            primary: profileTheme.primary,
            secondary: profileTheme.secondary,
            accent: profileTheme.accent,
            gradient: `linear-gradient(135deg, ${profileTheme.primary} 0%, ${profileTheme.accent} 100%)`
        },
        
        // Semantic colors
        success: '#10b981',
        successLight: 'rgba(16, 185, 129, 0.15)',
        warning: '#f59e0b',
        warningLight: 'rgba(245, 158, 11, 0.15)',
        error: '#ef4444',
        errorLight: 'rgba(239, 68, 68, 0.15)',
        info: '#3b82f6',
        infoLight: 'rgba(59, 130, 246, 0.15)',
        
        // Border colors
        border: {
            primary: `${profileTheme.primary}4D`,
            secondary: `${profileTheme.primary}33`,
            tertiary: 'rgba(100, 116, 139, 0.3)',
            card: 'rgba(100, 116, 139, 0.2)',
            hover: `${profileTheme.primary}80`
        },
        
        // Glow effects
        glow: {
            primary: `0 0 20px ${profileTheme.primary}40`,
            strong: `0 0 40px ${profileTheme.primary}60`,
            card: `0 10px 40px rgba(0, 0, 0, 0.3)`
        },
        
        // Chart colors
        chart: {
            green: '#10b981',
            red: '#ef4444',
            blue: profileTheme.primary,
            purple: '#8b5cf6',
            orange: '#f59e0b',
            cyan: '#06b6d4'
        },
        
        // Avatar border for current user
        avatarBorder: {
            color: borderColors.color,
            glow: borderColors.glow,
            animated: borderColors.animated || false,
            rainbow: borderColors.rainbow || false,
            pulse: borderColors.pulse || false,
            shimmer: borderColors.shimmer || false,
            flames: borderColors.flames || false,
            frost: borderColors.frost || false
        },
        
        // Rarity info
        rarity: {
            level: profileTheme.rarity,
            color: rarity.color,
            glow: rarity.glow,
            name: rarity.name
        },
        
        // Background effects config
        effects: profileTheme.effects,
        
        // Profile theme metadata
        profileTheme: {
            id: profileTheme.id,
            name: profileTheme.name,
            rarity: profileTheme.rarity,
            primary: profileTheme.primary,
            secondary: profileTheme.secondary,
            accent: profileTheme.accent,
            hasEffects: !!profileTheme.effects
        },
        
        // Backward compatibility - colors alias
        colors: {
            primary: profileTheme.primary,
            secondary: profileTheme.secondary,
            accent: profileTheme.accent,
            background: profileTheme.pageBackground,
            cardBg: 'rgba(15, 23, 42, 0.95)',
            text: '#e0e6ed',
            textSecondary: '#94a3b8',
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            border: `${profileTheme.primary}4D`
        }
    };
    
    // Light mode base
    const generateLightPageBackground = (themeId) => {
        const lightBackgrounds = {
            'theme-default': 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
            'theme-emerald': 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 50%, #ecfdf5 100%)',
            'theme-crimson': 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 50%, #fef2f2 100%)',
            'theme-ocean': 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
            'theme-forest': 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
            'theme-royal': 'linear-gradient(145deg, #faf5ff 0%, #ede9fe 50%, #faf5ff 100%)',
            'theme-midnight': 'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 50%, #eef2ff 100%)',
            'theme-sunset': 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 50%, #fffbeb 100%)',
            'theme-aurora': 'linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 50%, #f5f3ff 100%)',
            'theme-cyber': 'linear-gradient(145deg, #ecfeff 0%, #cffafe 50%, #fdf4ff 100%)',
            'theme-gold-rush': 'linear-gradient(145deg, #fefce8 0%, #fef9c3 50%, #fefce8 100%)',
            'theme-cosmic': 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
            'theme-phoenix': 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 50%, #fff7ed 100%)',
            'theme-storm': 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)',
            'theme-void-walker': 'linear-gradient(145deg, #faf5ff 0%, #ede9fe 50%, #faf5ff 100%)',
            'theme-celestial': 'linear-gradient(145deg, #fffbeb 0%, #fce7f3 50%, #fffbeb 100%)',
            'theme-dragon': 'linear-gradient(145deg, #fef2f2 0%, #fef3c7 50%, #fef2f2 100%)',
            'theme-arctic': 'linear-gradient(145deg, #ecfeff 0%, #cffafe 50%, #ecfeff 100%)'
        };
        return lightBackgrounds[themeId] || lightBackgrounds['theme-default'];
    };

    const lightBase = {
        mode: 'light',
        bg: {
            page: generateLightPageBackground(profileThemeId),
            card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            cardSolid: 'rgba(255, 255, 255, 0.98)',
            cardHover: 'rgba(248, 250, 252, 0.98)',
            input: 'rgba(255, 255, 255, 0.9)',
            overlay: 'rgba(0, 0, 0, 0.5)',
            navbar: 'rgba(255, 255, 255, 0.95)',
            dropdown: 'rgba(255, 255, 255, 0.98)',
            accent: profileTheme.background
        },
        text: {
            primary: '#0f172a',
            secondary: '#475569',
            tertiary: '#94a3b8',
            inverse: '#f8fafc'
        },
        brand: darkBase.brand,
        success: '#059669',
        successLight: 'rgba(5, 150, 105, 0.1)',
        warning: '#d97706',
        warningLight: 'rgba(217, 119, 6, 0.1)',
        error: '#dc2626',
        errorLight: 'rgba(220, 38, 38, 0.1)',
        info: '#2563eb',
        infoLight: 'rgba(37, 99, 235, 0.1)',
        border: {
            primary: `${profileTheme.primary}33`,
            secondary: `${profileTheme.primary}20`,
            tertiary: 'rgba(100, 116, 139, 0.2)',
            card: 'rgba(100, 116, 139, 0.15)',
            hover: `${profileTheme.primary}60`
        },
        glow: {
            primary: `0 0 15px ${profileTheme.primary}30`,
            strong: `0 0 30px ${profileTheme.primary}40`,
            card: `0 8px 30px rgba(0, 0, 0, 0.1)`
        },
        chart: darkBase.chart,
        avatarBorder: darkBase.avatarBorder,
        rarity: darkBase.rarity,
        effects: null, // No effects in light mode
        profileTheme: darkBase.profileTheme,
        
        // Backward compatibility - colors alias
        colors: {
            primary: profileTheme.primary,
            secondary: profileTheme.secondary,
            accent: profileTheme.accent,
            background: generateLightPageBackground(profileThemeId),
            cardBg: 'rgba(255, 255, 255, 0.98)',
            text: '#0f172a',
            textSecondary: '#475569',
            success: '#059669',
            error: '#dc2626',
            warning: '#d97706',
            border: `${profileTheme.primary}33`
        }
    };
    
    return baseMode === 'dark' ? darkBase : lightBase;
};

// ===== GET API BASE URL =====
const getApiBaseUrl = () => {
    if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
    if (process.env.REACT_APP_API_BASE_URL) return process.env.REACT_APP_API_BASE_URL;
    if (typeof window !== 'undefined') {
        const { hostname } = window.location;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000/api';
        }
        if (hostname.includes('nexussignal')) {
            return 'https://api.nexussignal.ai/api';
        }
    }
    return 'http://localhost:5000/api';
};

// ===== THEME PROVIDER =====
export const ThemeProvider = ({ children }) => {
    const [baseMode, setBaseMode] = useState(() => {
        const saved = localStorage.getItem('nexus-base-theme');
        return saved || 'dark';
    });
    
    const [profileThemeId, setProfileThemeId] = useState(() => {
        const saved = localStorage.getItem('nexus-profile-theme');
        return saved || 'theme-default';
    });
    
    const [loading, setLoading] = useState(true);
    
    const theme = buildTheme(baseMode, profileThemeId);
    
    // Fetch equipped theme from API
    const fetchEquippedTheme = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const API_BASE = getApiBaseUrl();
            const response = await fetch(`${API_BASE}/vault/equipped`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.equipped?.theme) {
                    const themeData = data.equipped.theme;
                    const themeId = typeof themeData === 'string' ? themeData : themeData.id;
                    const normalizedThemeId = themeId?.startsWith('theme-') ? themeId : `theme-${themeId}`;
                    
                    if (normalizedThemeId && vaultThemes[normalizedThemeId]) {
                        setProfileThemeId(normalizedThemeId);
                        localStorage.setItem('nexus-profile-theme', normalizedThemeId);
                    } else if (themeId && themeData.colors) {
                        // Custom theme from API
                        vaultThemes[normalizedThemeId] = {
                            id: normalizedThemeId,
                            name: themeData.name || themeId,
                            rarity: themeData.rarity || 'common',
                            primary: themeData.colors.primary,
                            secondary: themeData.colors.secondary,
                            accent: themeData.colors.accent,
                            background: themeData.colors.background,
                            pageBackground: themeData.colors.pageBackground || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
                            navbarBackground: themeData.colors.navbarBackground,
                            effects: themeData.effects || null
                        };
                        avatarBorderColors[normalizedThemeId] = {
                            color: themeData.colors.primary,
                            glow: `${themeData.colors.primary}80`
                        };
                        setProfileThemeId(normalizedThemeId);
                        localStorage.setItem('nexus-profile-theme', normalizedThemeId);
                    }
                }
            }
        } catch (error) {
            console.log('Could not fetch equipped theme:', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEquippedTheme();
    }, [fetchEquippedTheme]);

    const toggleMode = () => {
        setBaseMode(prev => {
            const newMode = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('nexus-base-theme', newMode);
            return newMode;
        });
    };

    const setProfileTheme = useCallback((themeId) => {
        const normalizedId = themeId?.startsWith('theme-') ? themeId : `theme-${themeId}`;
        
        if (vaultThemes[normalizedId]) {
            setProfileThemeId(normalizedId);
            localStorage.setItem('nexus-profile-theme', normalizedId);
        } else if (vaultThemes[themeId]) {
            setProfileThemeId(themeId);
            localStorage.setItem('nexus-profile-theme', themeId);
        }
    }, []);

    const refreshTheme = useCallback(async () => {
        await fetchEquippedTheme();
    }, [fetchEquippedTheme]);

    const getAvatarBorder = useCallback(() => {
        return avatarBorderColors[profileThemeId] || avatarBorderColors['theme-default'];
    }, [profileThemeId]);

    const getAvatarBorderForUser = useCallback((themeId) => {
        if (!themeId) return avatarBorderColors['theme-default'];
        if (avatarBorderColors[themeId]) return avatarBorderColors[themeId];
        const withPrefix = `theme-${themeId}`;
        if (avatarBorderColors[withPrefix]) return avatarBorderColors[withPrefix];
        const withoutPrefix = themeId.replace('theme-', '');
        if (avatarBorderColors[withoutPrefix]) return avatarBorderColors[withoutPrefix];
        return avatarBorderColors['theme-default'];
    }, []);

    const getRarityColor = useCallback((rarity) => {
        return rarityColors[rarity] || rarityColors.common;
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', baseMode);
        document.documentElement.setAttribute('data-profile-theme', profileThemeId);
        document.documentElement.setAttribute('data-theme-rarity', theme.rarity?.level || 'common');
    }, [baseMode, profileThemeId, theme.rarity]);

    const value = {
        theme,
        baseMode,
        profileThemeId,
        loading,
        toggleMode,
        setProfileTheme,
        refreshTheme,
        getAvatarBorder,
        getAvatarBorderForUser,
        getRarityColor,
        avatarBorder: theme.avatarBorder,
        isDark: baseMode === 'dark',
        isLight: baseMode === 'light',
        availableThemes: vaultThemes,
        avatarBorderColors,
        rarityColors,
        primary: theme.brand.primary,
        secondary: theme.brand.secondary,
        accent: theme.brand.accent,
        // New effect helpers
        hasEffects: !!theme.effects,
        effects: theme.effects,
        rarity: theme.rarity
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;