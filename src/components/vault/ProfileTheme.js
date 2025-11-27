// client/src/components/vault/ProfileTheme.js
// Theme definitions and utilities for profile customization

import { createContext, useContext } from 'react';

// ============ THEME DEFINITIONS ============
// Must match vaultItems.js themes
export const PROFILE_THEMES = {
    'theme-default': {
        name: 'Default',
        background: 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        cardBackground: 'rgba(30, 41, 59, 0.8)',
        cardBorder: 'rgba(0, 173, 239, 0.3)',
        accentColor: '#00adef',
        accentGradient: 'linear-gradient(135deg, #00adef 0%, #0891b2 100%)',
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        glowColor: 'rgba(0, 173, 239, 0.5)',
        headerGradient: 'linear-gradient(135deg, rgba(0, 173, 239, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
    },
    'theme-emerald': {
        name: 'Emerald Dreams',
        background: 'linear-gradient(145deg, #022c22 0%, #064e3b 50%, #022c22 100%)',
        cardBackground: 'rgba(6, 78, 59, 0.6)',
        cardBorder: 'rgba(16, 185, 129, 0.4)',
        accentColor: '#10b981',
        accentGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        textPrimary: '#ecfdf5',
        textSecondary: '#6ee7b7',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        headerGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.2) 100%)'
    },
    'theme-crimson': {
        name: 'Crimson Fire',
        background: 'linear-gradient(145deg, #1a0a0a 0%, #450a0a 50%, #1a0a0a 100%)',
        cardBackground: 'rgba(69, 10, 10, 0.6)',
        cardBorder: 'rgba(239, 68, 68, 0.4)',
        accentColor: '#ef4444',
        accentGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        textPrimary: '#fef2f2',
        textSecondary: '#fca5a5',
        glowColor: 'rgba(239, 68, 68, 0.5)',
        headerGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)'
    },
    'theme-ocean': {
        name: 'Ocean Depths',
        background: 'linear-gradient(145deg, #0c1929 0%, #1e3a5f 50%, #0c1929 100%)',
        cardBackground: 'rgba(30, 58, 95, 0.6)',
        cardBorder: 'rgba(59, 130, 246, 0.4)',
        accentColor: '#3b82f6',
        accentGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        textPrimary: '#eff6ff',
        textSecondary: '#93c5fd',
        glowColor: 'rgba(59, 130, 246, 0.5)',
        headerGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%)'
    },
    'theme-forest': {
        name: 'Forest Canopy',
        background: 'linear-gradient(145deg, #14231a 0%, #1e3a28 50%, #14231a 100%)',
        cardBackground: 'rgba(30, 58, 40, 0.6)',
        cardBorder: 'rgba(34, 197, 94, 0.4)',
        accentColor: '#22c55e',
        accentGradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        textPrimary: '#f0fdf4',
        textSecondary: '#86efac',
        glowColor: 'rgba(34, 197, 94, 0.5)',
        headerGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(22, 163, 74, 0.2) 100%)'
    },
    'theme-royal': {
        name: 'Royal Purple',
        background: 'linear-gradient(145deg, #1a0a2e 0%, #312e81 50%, #1a0a2e 100%)',
        cardBackground: 'rgba(49, 46, 129, 0.6)',
        cardBorder: 'rgba(139, 92, 246, 0.4)',
        accentColor: '#8b5cf6',
        accentGradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        textPrimary: '#f5f3ff',
        textSecondary: '#c4b5fd',
        glowColor: 'rgba(139, 92, 246, 0.5)',
        headerGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(124, 58, 237, 0.2) 100%)'
    },
    'theme-midnight': {
        name: 'Midnight Shadow',
        background: 'linear-gradient(145deg, #030712 0%, #111827 50%, #030712 100%)',
        cardBackground: 'rgba(17, 24, 39, 0.8)',
        cardBorder: 'rgba(75, 85, 99, 0.4)',
        accentColor: '#6b7280',
        accentGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        textPrimary: '#f9fafb',
        textSecondary: '#9ca3af',
        glowColor: 'rgba(107, 114, 128, 0.5)',
        headerGradient: 'linear-gradient(135deg, rgba(107, 114, 128, 0.2) 0%, rgba(75, 85, 99, 0.15) 100%)'
    },
    'theme-sunset': {
        name: 'Sunset Blaze',
        background: 'linear-gradient(145deg, #1a0f0a 0%, #431407 50%, #1a0f0a 100%)',
        cardBackground: 'rgba(67, 20, 7, 0.6)',
        cardBorder: 'rgba(249, 115, 22, 0.4)',
        accentColor: '#f97316',
        accentGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        textPrimary: '#fff7ed',
        textSecondary: '#fdba74',
        glowColor: 'rgba(249, 115, 22, 0.5)',
        headerGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(234, 88, 12, 0.2) 100%)'
    },
    'theme-aurora': {
        name: 'Aurora Borealis',
        background: 'linear-gradient(145deg, #0a1628 0%, #134e4a 30%, #1e1b4b 70%, #0a1628 100%)',
        cardBackground: 'rgba(19, 78, 74, 0.5)',
        cardBorder: 'rgba(20, 184, 166, 0.4)',
        accentColor: '#14b8a6',
        accentGradient: 'linear-gradient(135deg, #14b8a6 0%, #8b5cf6 100%)',
        textPrimary: '#f0fdfa',
        textSecondary: '#5eead4',
        glowColor: 'rgba(20, 184, 166, 0.5)',
        headerGradient: 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)'
    },
    'theme-cyberpunk': {
        name: 'Cyberpunk Neon',
        background: 'linear-gradient(145deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)',
        cardBackground: 'rgba(26, 10, 46, 0.7)',
        cardBorder: 'rgba(236, 72, 153, 0.5)',
        accentColor: '#ec4899',
        accentGradient: 'linear-gradient(135deg, #ec4899 0%, #06b6d4 100%)',
        textPrimary: '#fdf2f8',
        textSecondary: '#f9a8d4',
        glowColor: 'rgba(236, 72, 153, 0.6)',
        headerGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(6, 182, 212, 0.2) 100%)',
        special: 'neon'
    },
    'theme-gold-rush': {
        name: 'Gold Rush',
        background: 'linear-gradient(145deg, #1a1506 0%, #422006 50%, #1a1506 100%)',
        cardBackground: 'rgba(66, 32, 6, 0.6)',
        cardBorder: 'rgba(245, 158, 11, 0.5)',
        accentColor: '#f59e0b',
        accentGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        textPrimary: '#fffbeb',
        textSecondary: '#fcd34d',
        glowColor: 'rgba(245, 158, 11, 0.6)',
        headerGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.2) 100%)'
    },
    'theme-cosmic': {
        name: 'Cosmic Void',
        background: 'linear-gradient(145deg, #000000 0%, #0c0a1d 30%, #1a0a2e 50%, #0c0a1d 70%, #000000 100%)',
        cardBackground: 'rgba(12, 10, 29, 0.8)',
        cardBorder: 'rgba(167, 139, 250, 0.4)',
        accentColor: '#a78bfa',
        accentGradient: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #f472b6 100%)',
        textPrimary: '#faf5ff',
        textSecondary: '#c4b5fd',
        glowColor: 'rgba(167, 139, 250, 0.5)',
        headerGradient: 'linear-gradient(145deg, rgba(167, 139, 250, 0.2) 0%, rgba(192, 132, 252, 0.15) 50%, rgba(244, 114, 182, 0.1) 100%)',
        special: 'cosmic'
    }
};

// ============ THEME CONTEXT ============
const ThemeContext = createContext(null);

export const useProfileTheme = () => {
    const context = useContext(ThemeContext);
    return context;
};

// ============ HELPER FUNCTIONS ============
export const getTheme = (themeId) => {
    return PROFILE_THEMES[themeId] || PROFILE_THEMES['theme-default'];
};

export const getThemeCSS = (themeId) => {
    const theme = getTheme(themeId);
    return {
        '--profile-background': theme.background,
        '--profile-card-bg': theme.cardBackground,
        '--profile-card-border': theme.cardBorder,
        '--profile-accent': theme.accentColor,
        '--profile-accent-gradient': theme.accentGradient,
        '--profile-text-primary': theme.textPrimary,
        '--profile-text-secondary': theme.textSecondary,
        '--profile-glow': theme.glowColor,
        '--profile-header-gradient': theme.headerGradient
    };
};

// ============ STYLED HELPERS ============
// Use these in your styled-components
export const themeStyles = {
    background: 'var(--profile-background, linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%))',
    cardBackground: 'var(--profile-card-bg, rgba(30, 41, 59, 0.8))',
    cardBorder: 'var(--profile-card-border, rgba(0, 173, 239, 0.3))',
    accent: 'var(--profile-accent, #00adef)',
    accentGradient: 'var(--profile-accent-gradient, linear-gradient(135deg, #00adef 0%, #0891b2 100%))',
    textPrimary: 'var(--profile-text-primary, #f8fafc)',
    textSecondary: 'var(--profile-text-secondary, #94a3b8)',
    glow: 'var(--profile-glow, rgba(0, 173, 239, 0.5))',
    headerGradient: 'var(--profile-header-gradient, linear-gradient(135deg, rgba(0, 173, 239, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%))'
};

// ============ THEME PROVIDER COMPONENT ============
export const ProfileThemeProvider = ({ children, themeId = 'theme-default' }) => {
    const theme = getTheme(themeId);
    const cssVars = getThemeCSS(themeId);
    
    return (
        <ThemeContext.Provider value={{ theme, themeId, cssVars }}>
            <div style={cssVars}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

export default PROFILE_THEMES;