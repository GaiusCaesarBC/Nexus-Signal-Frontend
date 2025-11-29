// client/src/context/ThemeContext.js - THEME MANAGEMENT WITH VAULT INTEGRATION

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
const vaultThemes = {
    'theme-default': {
        id: 'theme-default',
        name: 'Default Theme',
        primary: '#00adef',
        secondary: '#0891b2',
        accent: '#06b6d4',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)'
    },
    'theme-emerald': {
        id: 'theme-emerald',
        name: 'Emerald Dreams',
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)'
    },
    'theme-crimson': {
        id: 'theme-crimson',
        name: 'Crimson Fire',
        primary: '#ef4444',
        secondary: '#dc2626',
        accent: '#f87171',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)'
    },
    'theme-ocean': {
        id: 'theme-ocean',
        name: 'Ocean Depths',
        primary: '#0ea5e9',
        secondary: '#0284c7',
        accent: '#38bdf8',
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(2, 132, 199, 0.15) 100%)'
    },
    'theme-forest': {
        id: 'theme-forest',
        name: 'Forest Canopy',
        primary: '#22c55e',
        secondary: '#16a34a',
        accent: '#4ade80',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%)'
    },
    'theme-royal': {
        id: 'theme-royal',
        name: 'Royal Purple',
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#a78bfa',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)'
    },
    'theme-midnight': {
        id: 'theme-midnight',
        name: 'Midnight Shadow',
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#818cf8',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.15) 100%)'
    },
    'theme-sunset': {
        id: 'theme-sunset',
        name: 'Sunset Blaze',
        primary: '#f59e0b',
        secondary: '#ec4899',
        accent: '#fb923c',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)'
    },
    'theme-aurora': {
        id: 'theme-aurora',
        name: 'Aurora Borealis',
        primary: '#14b8a6',
        secondary: '#a855f7',
        accent: '#2dd4bf',
        background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)'
    },
    'theme-cyber': {
        id: 'theme-cyber',
        name: 'Cyberpunk Neon',
        primary: '#06b6d4',
        secondary: '#d946ef',
        accent: '#22d3ee',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(217, 70, 239, 0.2) 100%)'
    },
    'theme-gold-rush': {
        id: 'theme-gold-rush',
        name: 'Gold Rush',
        primary: '#fbbf24',
        secondary: '#f59e0b',
        accent: '#fcd34d',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)'
    },
    'theme-cosmic': {
        id: 'theme-cosmic',
        name: 'Cosmic Void',
        primary: '#6366f1',
        secondary: '#0f172a',
        accent: '#a78bfa',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(6, 6, 39, 0.95) 100%)'
    }
};

// ===== BUILD COMPLETE THEME OBJECT =====
// Merges base theme (dark/light) with vault profile theme colors
const buildTheme = (baseMode, profileThemeId) => {
    const profileTheme = vaultThemes[profileThemeId] || vaultThemes['theme-default'];
    
    // Base dark theme structure
    const darkBase = {
        mode: 'dark',
        
        // Page backgrounds (these stay consistent)
        bg: {
            page: 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
            card: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            cardSolid: 'rgba(15, 23, 42, 0.95)',
            cardHover: 'rgba(30, 41, 59, 0.95)',
            input: 'rgba(15, 23, 42, 0.8)',
            overlay: 'rgba(0, 0, 0, 0.8)',
            navbar: 'rgba(10, 14, 39, 0.95)',
            // Profile theme background overlay
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
            primary: `${profileTheme.primary}4D`, // 30% opacity
            secondary: `${profileTheme.primary}33`, // 20% opacity
            tertiary: 'rgba(100, 116, 139, 0.3)',
            card: 'rgba(100, 116, 139, 0.2)',
            hover: `${profileTheme.primary}80` // 50% opacity
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
        
        // Profile theme metadata
        profileTheme: {
            id: profileTheme.id,
            name: profileTheme.name,
            primary: profileTheme.primary,
            secondary: profileTheme.secondary,
            accent: profileTheme.accent
        }
    };
    
    // Light mode base (if you want to support it later)
    const lightBase = {
        mode: 'light',
        bg: {
            page: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
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
// Some components might still use the old theme.colors structure
const buildLegacyTheme = (theme) => {
    return {
        ...theme,
        // Legacy colors object for backward compatibility
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

    // Fetch user's equipped theme from API
    const fetchEquippedTheme = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch('/api/vault/equipped', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.equipped?.theme) {
                    // Handle both string ID and full object response
                    const themeData = data.equipped.theme;
                    const themeId = typeof themeData === 'string' ? themeData : themeData.id;
                    
                    if (themeId && vaultThemes[themeId]) {
                        setProfileThemeId(themeId);
                        localStorage.setItem('nexus-profile-theme', themeId);
                        console.log('🎨 Loaded equipped theme:', themeId);
                    } else if (themeId) {
                        // Theme not in our local list, but we got colors from API
                        // Add it dynamically if it has color data
                        if (themeData.colors) {
                            vaultThemes[themeId] = {
                                id: themeId,
                                name: themeData.name || themeId,
                                primary: themeData.colors.primary,
                                secondary: themeData.colors.secondary,
                                accent: themeData.colors.accent,
                                background: themeData.colors.background
                            };
                            setProfileThemeId(themeId);
                            localStorage.setItem('nexus-profile-theme', themeId);
                            console.log('🎨 Loaded custom theme from API:', themeId);
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Could not fetch equipped theme, using default');
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
        if (vaultThemes[themeId]) {
            setProfileThemeId(themeId);
            localStorage.setItem('nexus-profile-theme', themeId);
            console.log('🎨 Profile theme changed to:', themeId);
        }
    }, []);

    // Refresh theme from API (call after equipping in vault)
    const refreshTheme = useCallback(async () => {
        await fetchEquippedTheme();
    }, [fetchEquippedTheme]);

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
        
        // Convenience booleans
        isDark: baseMode === 'dark',
        isLight: baseMode === 'light',
        
        // Available themes for UI
        availableThemes: vaultThemes,
        
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