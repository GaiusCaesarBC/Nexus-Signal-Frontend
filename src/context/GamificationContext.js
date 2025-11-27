// client/src/context/GamificationContext.js
// UPDATED - Includes vault data (equippedBorder, equippedTheme, equippedBadges)

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const GamificationContext = createContext();

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
                
                // Get vault data - check multiple locations
                const vaultData = response.data.vault || 
                                 rawData.vault || 
                                 rawData.equippedItems || 
                                 {};
                
                const data = {
                    // Core gamification fields
                    level: rawData.level || 1,
                    xp: rawData.xp || 0,
                    rank: rawData.rank || 'Rookie Trader',
                    nexusCoins: rawData.nexusCoins || response.data.nexusCoins || 0,
                    loginStreak: rawData.loginStreak || 0,
                    maxLoginStreak: rawData.maxLoginStreak || 0,
                    totalEarned: rawData.totalEarned || 0,
                    profitStreak: rawData.profitStreak || 0,
                    maxProfitStreak: rawData.maxProfitStreak || 0,
                    
                    // XP progress
                    xpForCurrentLevel: rawData.xpForCurrentLevel || 0,
                    xpForNextLevel: rawData.xpForNextLevel || 1000,
                    progressPercent: rawData.xpForNextLevel ? 
                        Math.min(100, ((rawData.xp - rawData.xpForCurrentLevel) / (rawData.xpForNextLevel - rawData.xpForCurrentLevel)) * 100) : 0,
                    
                    // Stats
                    stats: rawData.stats || {},
                    
                    // Achievements
                    achievements: rawData.achievements || [],
                    
                    // Daily challenge
                    dailyChallenge: rawData.dailyChallenge || null,
                    
                    // VAULT DATA - For borders, themes, badges across the app
                    vault: {
                        equippedBorder: vaultData.equippedBorder || 
                                       vaultData.avatarBorder || 
                                       'border-bronze',
                        equippedTheme: vaultData.equippedTheme || 
                                      vaultData.profileTheme || 
                                      'theme-default',
                        equippedBadges: vaultData.equippedBadges || 
                                       vaultData.badges || 
                                       [],
                        activePerks: vaultData.activePerks || 
                                    (vaultData.activePerk ? [vaultData.activePerk] : []),
                        ownedItems: vaultData.ownedItems || 
                                   ['border-bronze', 'theme-default']
                    },
                    
                    // Legacy support
                    equippedItems: rawData.equippedItems || {
                        avatarBorder: vaultData.equippedBorder || 'border-bronze',
                        profileTheme: vaultData.equippedTheme || 'theme-default',
                        activePerk: vaultData.activePerks?.[0] || null,
                        badges: vaultData.equippedBadges || []
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
            setError(err.message);
            
            // Set defaults on error
            setGamificationData({
                level: 1,
                xp: 0,
                rank: 'Rookie Trader',
                nexusCoins: 0,
                loginStreak: 0,
                stats: {},
                vault: {
                    equippedBorder: 'border-bronze',
                    equippedTheme: 'theme-default',
                    equippedBadges: [],
                    activePerks: []
                }
            });
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