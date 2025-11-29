// client/src/context/ThemeContext.js - THEME MANAGEMENT WITH VAULT INTEGRATION
// UPDATED: Each theme now has its own unique page background

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// ===== VAULT PROFILE THEMES (from vaultItems.js) =====
// UPDATED: Added pageBackground for each theme
const vaultThemes = {
    'theme-default': {
        id: 'theme-default',
        name: 'Default Theme',
        primary: '#00adef',
        secondary: '#0891b2',
        accent: '#06b6d4',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        pageBackground: 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(10, 14, 39, 0.98) 0%, rgba(10, 14, 39, 0.95) 100%)'
    },
    'theme-emerald': {
        id: 'theme-emerald',
        name: 'Emerald Dreams',
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #021a12 0%, #0a2920 50%, #021a12 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(2, 26, 18, 0.98) 0%, rgba(2, 26, 18, 0.95) 100%)'
    },
    'theme-crimson': {
        id: 'theme-crimson',
        name: 'Crimson Fire',
        primary: '#ef4444',
        secondary: '#dc2626',
        accent: '#f87171',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #1a0505 0%, #2d0a0a 50%, #1a0505 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(26, 5, 5, 0.98) 0%, rgba(26, 5, 5, 0.95) 100%)'
    },
    'theme-ocean': {
        id: 'theme-ocean',
        name: 'Ocean Depths',
        primary: '#0ea5e9',
        secondary: '#0284c7',
        accent: '#38bdf8',
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(2, 132, 199, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #021526 0%, #0a2540 50%, #021526 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(2, 21, 38, 0.98) 0%, rgba(2, 21, 38, 0.95) 100%)'
    },
    'theme-forest': {
        id: 'theme-forest',
        name: 'Forest Canopy',
        primary: '#22c55e',
        secondary: '#16a34a',
        accent: '#4ade80',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #051a0a 0%, #0d2914 50%, #051a0a 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(5, 26, 10, 0.98) 0%, rgba(5, 26, 10, 0.95) 100%)'
    },
    'theme-royal': {
        id: 'theme-royal',
        name: 'Royal Purple',
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #0f0720 0%, #1a0f30 50%, #0f0720 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(15, 7, 32, 0.98) 0%, rgba(15, 7, 32, 0.95) 100%)'
    },
    'theme-midnight': {
        id: 'theme-midnight',
        name: 'Midnight Shadow',
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#818cf8',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #080820 0%, #101035 50%, #080820 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(8, 8, 32, 0.98) 0%, rgba(8, 8, 32, 0.95) 100%)'
    },
    'theme-sunset': {
        id: 'theme-sunset',
        name: 'Sunset Blaze',
        primary: '#f59e0b',
        secondary: '#ec4899',
        accent: '#fb923c',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #1a0f05 0%, #2d1510 50%, #1a0f05 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(26, 15, 5, 0.98) 0%, rgba(26, 15, 5, 0.95) 100%)'
    },
    'theme-aurora': {
        id: 'theme-aurora',
        name: 'Aurora Borealis',
        primary: '#14b8a6',
        secondary: '#a855f7',
        accent: '#2dd4bf',
        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        pageBackground: 'linear-gradient(145deg, #021515 0%, #0a1a25 50%, #0f0a20 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(2, 21, 21, 0.98) 0%, rgba(2, 21, 21, 0.95) 100%)'
    },
    'theme-cyber': {
        id: 'theme-cyber',
        name: 'Cyberpunk Neon',
        primary: '#06b6d4',
        secondary: '#d946ef',
        accent: '#22d3ee',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(217, 70, 239, 0.2) 100%)',
        pageBackground: 'linear-gradient(145deg, #05101a 0%, #100520 50%, #05101a 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(5, 16, 26, 0.98) 0%, rgba(5, 16, 26, 0.95) 100%)'
    },
    'theme-gold-rush': {
        id: 'theme-gold-rush',
        name: 'Gold Rush',
        primary: '#fbbf24',
        secondary: '#f59e0b',
        accent: '#fcd34d',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
        pageBackground: 'linear-gradient(145deg, #1a1505 0%, #2d2008 50%, #1a1505 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(26, 21, 5, 0.98) 0%, rgba(26, 21, 5, 0.95) 100%)'
    },
    'theme-cosmic': {
        id: 'theme-cosmic',
        name: 'Cosmic Void',
        primary: '#6366f1',
        secondary: '#0f172a',
        accent: '#a78bfa',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 6, 39, 0.95) 100%)',
        pageBackground: 'linear-gradient(145deg, #020208 0%, #0a0a1a 50%, #020208 100%)',
        navbarBackground: 'linear-gradient(180deg, rgba(2, 2, 8, 0.98) 0%, rgba(2, 2, 8, 0.95) 100%)'
    }
};

// ===== AVATAR BORDER COLORS FOR EACH THEME =====
// Used to show themed borders on user avatars throughout the app
// Includes both "theme-xxx" and "xxx" formats for flexibility
const avatarBorderColors = {
    // With "theme-" prefix
    'theme-default': { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    'theme-emerald': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
    'theme-crimson': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
    'theme-ocean': { color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.5)' },
    'theme-forest': { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' },
    'theme-royal': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
    'theme-midnight': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.5)' },
    'theme-sunset': { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
    'theme-aurora': { color: '#14b8a6', glow: 'rgba(20, 184, 166, 0.5)' },
    'theme-cyber': { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' },
    'theme-gold-rush': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
    'theme-cosmic': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.5)' },
    // Without "theme-" prefix (for API responses that don't include prefix)
    'default': { color: '#00adef', glow: 'rgba(0, 173, 239, 0.5)' },
    'emerald': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
    'crimson': { color: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
    'ocean': { color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.5)' },
    'forest': { color: '#22c55e', glow: 'rgba(34, 197, 94, 0.5)' },
    'royal': { color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
    'midnight': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.5)' },
    'sunset': { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
    'aurora': { color: '#14b8a6', glow: 'rgba(20, 184, 166, 0.5)' },
    'cyber': { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.5)' },
    'gold-rush': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
    'cosmic': { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.5)' }
};

// ===== BUILD COMPLETE THEME OBJECT =====
// Merges base theme (dark/light) with vault profile theme colors
const buildTheme = (baseMode, profileThemeId) => {
    const profileTheme = vaultThemes[profileThemeId] || vaultThemes['theme-default'];
    const borderColors = avatarBorderColors[profileThemeId] || avatarBorderColors['theme-default'];
    
    // Base dark theme structure
    const darkBase = {
        mode: 'dark',
        
        // Page backgrounds - NOW USES PROFILE THEME'S PAGE BACKGROUND
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
        
        // Semantic colors (status indicators - these stay consistent)
        success: '#10b981',
        successLight: 'rgba(16, 185, 129, 0.15)',
        warning: '#f59e0b',
        warningLight: 'rgba(245, 158, 11, 0.15)',
        error: '#ef4444',
        errorLight: 'rgba(239, 68, 68, 0.15)',
        info: '#3b82f6',
        infoLight: 'rgba(59, 130, 246, 0.15)',
        
        // Border colors using profile theme
        border: {
            primary: `${profileTheme.primary}4D`,
            secondary: `${profileTheme.primary}33`,
            tertiary: 'rgba(100, 116, 139, 0.3)',
            card: 'rgba(100, 116, 139, 0.2)',
            hover: `${profileTheme.primary}80`
        },
        
        // Shadow/glow using profile theme
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
        
        // Avatar border colors for current user
        avatarBorder: {
            color: borderColors.color,
            glow: borderColors.glow
        },
        
        // Profile theme metadata
        profileTheme: {
            id: profileTheme.id,
            name: profileTheme.name,
            primary: profileTheme.primary,
            secondary: profileTheme.secondary,
            accent: profileTheme.accent
        }
    };
    
    // Light mode base - Generate light versions of page backgrounds
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
            'theme-cosmic': 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)'
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
            accent: profileTheme.background
        },
        text: {
            primary: '#0f172a',
            secondary: '#475569',
            tertiary: '#94a3b8',
            inverse: '#f8fafc'
        },
        brand: {
            primary: profileTheme.primary,
            secondary: profileTheme.secondary,
            accent: profileTheme.accent,
            gradient: `linear-gradient(135deg, ${profileTheme.primary} 0%, ${profileTheme.accent} 100%)`
        },
        success: '#059669',
        successLight: 'rgba(5, 150, 105, 0.15)',
        warning: '#d97706',
        warningLight: 'rgba(217, 119, 6, 0.15)',
        error: '#dc2626',
        errorLight: 'rgba(220, 38, 38, 0.15)',
        info: '#2563eb',
        infoLight: 'rgba(37, 99, 235, 0.15)',
        border: {
            primary: `${profileTheme.primary}4D`,
            secondary: `${profileTheme.primary}33`,
            tertiary: 'rgba(148, 163, 184, 0.3)',
            card: 'rgba(148, 163, 184, 0.2)',
            hover: `${profileTheme.primary}80`
        },
        glow: {
            primary: `0 0 20px ${profileTheme.primary}30`,
            strong: `0 0 40px ${profileTheme.primary}50`,
            card: `0 10px 40px rgba(0, 0, 0, 0.1)`
        },
        chart: {
            green: '#059669',
            red: '#dc2626',
            blue: profileTheme.primary,
            purple: '#7c3aed',
            orange: '#d97706',
            cyan: '#0891b2'
        },
        avatarBorder: {
            color: borderColors.color,
            glow: borderColors.glow
        },
        profileTheme: {
            id: profileTheme.id,
            name: profileTheme.name,
            primary: profileTheme.primary,
            secondary: profileTheme.secondary,
            accent: profileTheme.accent
        }
    };
    
    return baseMode === 'light' ? lightBase : darkBase;
};

// ===== LEGACY THEME FORMAT (for backward compatibility) =====
const buildLegacyTheme = (theme) => {
    return {
        ...theme,
        colors: {
            bg: theme.bg,
            text: theme.text,
            brand: theme.brand,
            success: theme.success,
            warning: theme.warning,
            error: theme.error,
            info: theme.info,
            border: theme.border
        }
    };
};

// ===== HELPER FUNCTION: Get avatar border color for any user =====
// Handles both "theme-xxx" and "xxx" formats
export const getAvatarBorderForTheme = (themeId) => {
    if (!themeId) {
        return avatarBorderColors['theme-default'];
    }
    // Try direct lookup first, then try with/without prefix
    if (avatarBorderColors[themeId]) {
        return avatarBorderColors[themeId];
    }
    // Try adding prefix
    const withPrefix = `theme-${themeId}`;
    if (avatarBorderColors[withPrefix]) {
        return avatarBorderColors[withPrefix];
    }
    // Try removing prefix
    const withoutPrefix = themeId.replace('theme-', '');
    if (avatarBorderColors[withoutPrefix]) {
        return avatarBorderColors[withoutPrefix];
    }
    return avatarBorderColors['theme-default'];
};

// ===== EXPORT AVATAR BORDER COLORS FOR USE IN OTHER COMPONENTS =====
export const AVATAR_BORDER_COLORS = avatarBorderColors;

// ===== EXPORT VAULT THEMES FOR USE IN OTHER COMPONENTS =====
export const VAULT_THEMES = vaultThemes;

// ===== GET API BASE URL =====
const getApiBaseUrl = () => {
    // Check for environment variable first
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    // Check if we're in production
    if (window.location.hostname !== 'localhost') {
        return 'https://api.nexussignal.ai/api';
    }
    // Local development fallback
    return 'http://localhost:5000/api';
};

export const ThemeProvider = ({ children }) => {
    // Base mode: dark or light
    const [baseMode, setBaseMode] = useState(() => {
        const saved = localStorage.getItem('nexus-base-theme');
        return saved || 'dark';
    });
    
    // Profile theme from vault
    const [profileThemeId, setProfileThemeId] = useState(() => {
        const saved = localStorage.getItem('nexus-profile-theme');
        return saved || 'theme-default';
    });
    
    // Loading state for initial fetch
    const [loading, setLoading] = useState(true);

    // Build the complete theme object
    const theme = buildLegacyTheme(buildTheme(baseMode, profileThemeId));

    // 🔥 FIXED: Fetch user's equipped theme from API with proper auth
    const fetchEquippedTheme = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('🎨 No token found, using default theme');
                setLoading(false);
                return;
            }

            const API_BASE = getApiBaseUrl();
            console.log('🎨 Fetching equipped theme from:', `${API_BASE}/vault/equipped`);

            // 🔥 FIX: Use BOTH auth methods - x-auth-token header AND credentials for cookies
            const response = await fetch(`${API_BASE}/vault/equipped`, {
                method: 'GET',
                credentials: 'include', // 🔥 Include cookies for cross-origin requests
                headers: {
                    'x-auth-token': token, // 🔥 Use x-auth-token instead of Authorization: Bearer
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('🎨 Equipped theme response:', data);
                
                if (data.success && data.equipped?.theme) {
                    const themeData = data.equipped.theme;
                    const themeId = typeof themeData === 'string' ? themeData : themeData.id;
                    
                    // Normalize theme ID to include prefix
                    const normalizedThemeId = themeId?.startsWith('theme-') ? themeId : `theme-${themeId}`;
                    
                    if (normalizedThemeId && vaultThemes[normalizedThemeId]) {
                        setProfileThemeId(normalizedThemeId);
                        localStorage.setItem('nexus-profile-theme', normalizedThemeId);
                        console.log('🎨 ✅ Loaded equipped theme:', normalizedThemeId);
                    } else if (themeId) {
                        // Custom theme from API
                        if (themeData.colors) {
                            vaultThemes[normalizedThemeId] = {
                                id: normalizedThemeId,
                                name: themeData.name || themeId,
                                primary: themeData.colors.primary,
                                secondary: themeData.colors.secondary,
                                accent: themeData.colors.accent,
                                background: themeData.colors.background,
                                pageBackground: themeData.colors.pageBackground || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)'
                            };
                            // Also add to avatar border colors
                            avatarBorderColors[normalizedThemeId] = {
                                color: themeData.colors.primary,
                                glow: `${themeData.colors.primary}80`
                            };
                            setProfileThemeId(normalizedThemeId);
                            localStorage.setItem('nexus-profile-theme', normalizedThemeId);
                            console.log('🎨 ✅ Loaded custom theme from API:', normalizedThemeId);
                        }
                    }
                } else {
                    console.log('🎨 No equipped theme in response, using localStorage or default');
                }
            } else {
                console.log('🎨 ⚠️ Failed to fetch equipped theme:', response.status, response.statusText);
                // Don't clear localStorage theme on API failure - keep using cached theme
            }
        } catch (error) {
            console.log('🎨 ⚠️ Could not fetch equipped theme:', error.message);
            // Keep using localStorage theme on error
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch equipped theme on mount
    useEffect(() => {
        fetchEquippedTheme();
    }, [fetchEquippedTheme]);

    // Toggle dark/light mode
    const toggleMode = () => {
        setBaseMode(prev => {
            const newMode = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('nexus-base-theme', newMode);
            return newMode;
        });
    };

    // Set profile theme (called when user equips a theme in vault)
    const setProfileTheme = useCallback((themeId) => {
        // Normalize to include prefix
        const normalizedId = themeId?.startsWith('theme-') ? themeId : `theme-${themeId}`;
        
        if (vaultThemes[normalizedId]) {
            setProfileThemeId(normalizedId);
            localStorage.setItem('nexus-profile-theme', normalizedId);
            console.log('🎨 Profile theme changed to:', normalizedId);
        } else if (vaultThemes[themeId]) {
            // Fallback to original ID
            setProfileThemeId(themeId);
            localStorage.setItem('nexus-profile-theme', themeId);
            console.log('🎨 Profile theme changed to:', themeId);
        }
    }, []);

    // Refresh theme from API (call after equipping in vault)
    const refreshTheme = useCallback(async () => {
        await fetchEquippedTheme();
    }, [fetchEquippedTheme]);

    // Get avatar border for current user
    const getAvatarBorder = useCallback(() => {
        return avatarBorderColors[profileThemeId] || avatarBorderColors['theme-default'];
    }, [profileThemeId]);

    // Get avatar border for any theme ID (for other users)
    // Handles both "theme-xxx" and "xxx" formats
    const getAvatarBorderForUser = useCallback((themeId) => {
        if (!themeId) return avatarBorderColors['theme-default'];
        
        // Try direct lookup first
        if (avatarBorderColors[themeId]) {
            return avatarBorderColors[themeId];
        }
        // Try adding prefix
        const withPrefix = `theme-${themeId}`;
        if (avatarBorderColors[withPrefix]) {
            return avatarBorderColors[withPrefix];
        }
        // Try removing prefix
        const withoutPrefix = themeId.replace('theme-', '');
        if (avatarBorderColors[withoutPrefix]) {
            return avatarBorderColors[withoutPrefix];
        }
        
        return avatarBorderColors['theme-default'];
    }, []);

    // Update document attribute for CSS
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', baseMode);
        document.documentElement.setAttribute('data-profile-theme', profileThemeId);
    }, [baseMode, profileThemeId]);

    const value = {
        // Complete theme object for styled-components
        theme,
        
        // Current states
        baseMode,
        profileThemeId,
        loading,
        
        // Actions
        toggleMode,
        setProfileTheme,
        refreshTheme,
        
        // Avatar border helpers
        getAvatarBorder,
        getAvatarBorderForUser,
        avatarBorder: theme.avatarBorder,
        
        // Convenience booleans
        isDark: baseMode === 'dark',
        isLight: baseMode === 'light',
        
        // Available themes for UI
        availableThemes: vaultThemes,
        avatarBorderColors,
        
        // Quick access to brand colors
        primary: theme.brand.primary,
        secondary: theme.brand.secondary,
        accent: theme.brand.accent
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;