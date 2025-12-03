// client/src/context/GamificationContext.js
// UPDATED - Includes vault data (equippedBorder, equippedTheme, equippedBadges)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const GamificationContext = createContext();

// Helper function to safely extract data with validation
const safeGet = (obj, path, defaultValue) => {
    if (!obj || typeof obj !== 'object') return defaultValue;
    const value = path.split('.').reduce((acc, key) => acc?.[key], obj);
    return value !== undefined && value !== null ? value : defaultValue;
};

// Default gamification data structure
const DEFAULT_GAMIFICATION_DATA = {
    level: 1,
    xp: 0,
    rank: 'Rookie Trader',
    nexusCoins: 0,
    loginStreak: 0,
    maxLoginStreak: 0,
    totalEarned: 0,
    profitStreak: 0,
    maxProfitStreak: 0,
    xpForCurrentLevel: 0,
    xpForNextLevel: 1000,
    progressPercent: 0,
    stats: {},
    achievements: [],
    dailyChallenge: null,
    vault: {
        equippedBorder: 'border-bronze',
        equippedTheme: 'theme-default',
        equippedBadges: [],
        activePerks: [],
        ownedItems: ['border-bronze', 'theme-default']
    },
    equippedItems: {
        avatarBorder: 'border-bronze',
        profileTheme: 'theme-default',
        activePerk: null,
        badges: []
    }
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};

export const GamificationProvider = ({ children }) => {
    const { api, isAuthenticated, user } = useAuth();
    const [gamificationData, setGamificationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchGamificationData = useCallback(async () => {
        if (!isAuthenticated) {
            setGamificationData(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/gamification/stats');

            if (response.data) {
                // Handle both response structures:
                // response.data.data.* (nested) or response.data.* (flat)
                const rawData = response.data.data || response.data;

                // Validate rawData is an object
                if (typeof rawData !== 'object' || rawData === null) {
                    console.warn('[GamificationContext] Invalid API response structure');
                    setGamificationData({ ...DEFAULT_GAMIFICATION_DATA });
                    return;
                }

                // Get vault data - check multiple locations with validation
                const vaultData = safeGet(response.data, 'vault', null) ||
                                 safeGet(rawData, 'vault', null) ||
                                 safeGet(rawData, 'equippedItems', {});

                // Calculate XP progress safely
                const xp = safeGet(rawData, 'xp', 0);
                const xpForCurrentLevel = safeGet(rawData, 'xpForCurrentLevel', 0);
                const xpForNextLevel = safeGet(rawData, 'xpForNextLevel', 1000);
                const xpRange = xpForNextLevel - xpForCurrentLevel;
                const progressPercent = xpRange > 0
                    ? Math.min(100, Math.max(0, ((xp - xpForCurrentLevel) / xpRange) * 100))
                    : 0;

                const data = {
                    // Core gamification fields
                    level: safeGet(rawData, 'level', 1),
                    xp,
                    rank: safeGet(rawData, 'rank', 'Rookie Trader'),
                    nexusCoins: safeGet(rawData, 'nexusCoins', null) ?? safeGet(response.data, 'nexusCoins', 0),
                    loginStreak: safeGet(rawData, 'loginStreak', 0),
                    maxLoginStreak: safeGet(rawData, 'maxLoginStreak', 0),
                    totalEarned: safeGet(rawData, 'totalEarned', 0),
                    profitStreak: safeGet(rawData, 'profitStreak', 0),
                    maxProfitStreak: safeGet(rawData, 'maxProfitStreak', 0),

                    // XP progress
                    xpForCurrentLevel,
                    xpForNextLevel,
                    progressPercent,

                    // Stats
                    stats: safeGet(rawData, 'stats', {}),

                    // Achievements
                    achievements: Array.isArray(rawData.achievements) ? rawData.achievements : [],

                    // Daily challenge
                    dailyChallenge: safeGet(rawData, 'dailyChallenge', null),

                    // VAULT DATA - For borders, themes, badges across the app
                    vault: {
                        equippedBorder: safeGet(vaultData, 'equippedBorder', null) ||
                                       safeGet(vaultData, 'avatarBorder', 'border-bronze'),
                        equippedTheme: safeGet(vaultData, 'equippedTheme', null) ||
                                      safeGet(vaultData, 'profileTheme', 'theme-default'),
                        equippedBadges: Array.isArray(vaultData?.equippedBadges) ? vaultData.equippedBadges :
                                       (Array.isArray(vaultData?.badges) ? vaultData.badges : []),
                        activePerks: Array.isArray(vaultData?.activePerks) ? vaultData.activePerks :
                                    (vaultData?.activePerk ? [vaultData.activePerk] : []),
                        ownedItems: Array.isArray(vaultData?.ownedItems) ? vaultData.ownedItems :
                                   ['border-bronze', 'theme-default']
                    },

                    // Legacy support
                    equippedItems: rawData.equippedItems || {
                        avatarBorder: safeGet(vaultData, 'equippedBorder', 'border-bronze'),
                        profileTheme: safeGet(vaultData, 'equippedTheme', 'theme-default'),
                        activePerk: vaultData?.activePerks?.[0] || null,
                        badges: Array.isArray(vaultData?.equippedBadges) ? vaultData.equippedBadges : []
                    }
                };

                setGamificationData(data);
                console.log('[GamificationContext] Data loaded:', {
                    level: data.level,
                    coins: data.nexusCoins,
                    border: data.vault.equippedBorder,
                    theme: data.vault.equippedTheme,
                    badges: data.vault.equippedBadges?.length || 0
                });
            }
            setError(null);
        } catch (err) {
            console.error('[GamificationContext] Error fetching data:', err);
            setError(err.message || 'Failed to load gamification data');

            // Set defaults on error
            setGamificationData({ ...DEFAULT_GAMIFICATION_DATA });
        } finally {
            setLoading(false);
        }
    }, [api, isAuthenticated]);

    // Fetch on mount and when auth changes
    useEffect(() => {
        fetchGamificationData();
    }, [fetchGamificationData]);

    // Refresh function - call after purchases, equipping items, etc.
    const refreshGamification = useCallback(async () => {
        console.log('[GamificationContext] Refreshing...');
        await fetchGamificationData();
    }, [fetchGamificationData]);

    // Add XP locally (optimistic update)
    const addXP = useCallback((amount) => {
        setGamificationData(prev => {
            if (!prev) return prev;
            
            const newXP = prev.xp + amount;
            const xpForNext = prev.xpForNextLevel || 1000;
            
            // Check for level up
            if (newXP >= xpForNext) {
                // Level up! Refresh to get accurate data
                refreshGamification();
            }
            
            return {
                ...prev,
                xp: newXP,
                progressPercent: Math.min(100, ((newXP - prev.xpForCurrentLevel) / (xpForNext - prev.xpForCurrentLevel)) * 100)
            };
        });
    }, [refreshGamification]);

    // Update coins locally (optimistic update)
    const updateCoins = useCallback((newAmount) => {
        setGamificationData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                nexusCoins: newAmount
            };
        });
    }, []);

    // Update equipped border locally (optimistic update)
    const updateEquippedBorder = useCallback((borderId) => {
        setGamificationData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                vault: {
                    ...prev.vault,
                    equippedBorder: borderId
                },
                equippedItems: {
                    ...prev.equippedItems,
                    avatarBorder: borderId
                }
            };
        });
    }, []);

    // Update equipped theme locally
    const updateEquippedTheme = useCallback((themeId) => {
        setGamificationData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                vault: {
                    ...prev.vault,
                    equippedTheme: themeId
                },
                equippedItems: {
                    ...prev.equippedItems,
                    profileTheme: themeId
                }
            };
        });
    }, []);

    // Update equipped badges locally
    const updateEquippedBadges = useCallback((badges) => {
        setGamificationData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                vault: {
                    ...prev.vault,
                    equippedBadges: badges
                },
                equippedItems: {
                    ...prev.equippedItems,
                    badges: badges
                }
            };
        });
    }, []);

    // Update active perks locally
    const updateActivePerks = useCallback((perks) => {
        setGamificationData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                vault: {
                    ...prev.vault,
                    activePerks: perks
                },
                equippedItems: {
                    ...prev.equippedItems,
                    activePerk: perks[0] || null
                }
            };
        });
    }, []);

    const value = {
        // Full data object
        gamificationData,
        loading,
        error,
        
        // Convenience accessors (commonly used)
        level: gamificationData?.level || 1,
        xp: gamificationData?.xp || 0,
        nexusCoins: gamificationData?.nexusCoins || 0,
        loginStreak: gamificationData?.loginStreak || 0,
        rank: gamificationData?.rank || 'Rookie Trader',
        stats: gamificationData?.stats || {},
        achievements: gamificationData?.achievements || [],
        
        // Vault data (for borders, themes, badges)
        vault: gamificationData?.vault || {
            equippedBorder: 'border-bronze',
            equippedTheme: 'theme-default',
            equippedBadges: [],
            activePerks: []
        },
        
        // Legacy support
        equippedItems: gamificationData?.equippedItems || {},
        
        // XP progress
        xpForCurrentLevel: gamificationData?.xpForCurrentLevel || 0,
        xpForNextLevel: gamificationData?.xpForNextLevel || 1000,
        progressPercent: gamificationData?.progressPercent || 0,
        
        // Functions
        refreshGamification,
        addXP,
        updateCoins,
        updateEquippedBorder,
        updateEquippedTheme,
        updateEquippedBadges,
        updateActivePerks
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};

export default GamificationContext;