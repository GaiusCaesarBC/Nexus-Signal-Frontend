// client/src/context/VaultContext.js
// Central context for vault data - provides equipped items across the app
// Use this in Navbar, Feed, Leaderboard, Profile, etc.

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

// ============ CONTEXT ============
const VaultContext = createContext(null);

// ============ PROVIDER ============
export const VaultProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    // Current user's vault state
    const [equippedBorder, setEquippedBorder] = useState('border-bronze');
    const [equippedTheme, setEquippedTheme] = useState('theme-default');
    const [equippedBadges, setEquippedBadges] = useState([]);
    const [activePerks, setActivePerks] = useState([]);
    const [ownedItems, setOwnedItems] = useState(['border-bronze', 'theme-default']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cache for other users' vault data (for feed/leaderboard)
    const [userVaultCache, setUserVaultCache] = useState({});
    // Use ref to avoid useCallback recreation on cache updates
    const userVaultCacheRef = useRef(userVaultCache);
    userVaultCacheRef.current = userVaultCache;

    // Fetch current user's equipped items
    const fetchEquipped = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            const response = await api.get('/vault/equipped');
            
            if (response.data.success) {
                const { equipped } = response.data;
                setEquippedBorder(equipped.border?.id || 'border-bronze');
                setEquippedTheme(equipped.theme?.id || 'theme-default');
                setEquippedBadges(equipped.badges?.map(b => b.id) || []);
                setActivePerks(equipped.perks?.map(p => p.id) || []);
            }
            setError(null);
        } catch (err) {
            console.error('[VaultContext] Error fetching equipped items:', err);
            setError(err.message);
            // Use defaults on error
            setEquippedBorder('border-bronze');
            setEquippedTheme('theme-default');
            setEquippedBadges([]);
            setActivePerks([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch all vault data (items + ownership)
    const fetchVaultData = useCallback(async () => {
        if (!isAuthenticated) return null;
        
        try {
            const response = await api.get('/vault/items');
            if (response.data.success) {
                const { vault, items } = response.data;
                
                // Update equipped state
                setEquippedBorder(vault.equippedBorder || 'border-bronze');
                setEquippedTheme(vault.equippedTheme || 'theme-default');
                setEquippedBadges(vault.equippedBadges || []);
                setActivePerks(vault.activePerks || []);
                
                // Build owned items list
                const owned = [];
                Object.values(items).forEach(category => {
                    category.forEach(item => {
                        if (item.owned) owned.push(item.id);
                    });
                });
                setOwnedItems(owned);
                
                return response.data;
            }
        } catch (err) {
            console.error('[VaultContext] Error fetching vault data:', err);
            return null;
        }
    }, [isAuthenticated]);

    // Fetch another user's vault (for feed/leaderboard/profile viewing)
    const fetchUserVault = useCallback(async (userId) => {
        // Check cache first (using ref to avoid dependency issues)
        if (userVaultCacheRef.current[userId]) {
            return userVaultCacheRef.current[userId];
        }

        try {
            const response = await api.get(`/vault/user/${userId}`);
            if (response.data.success) {
                const vaultData = {
                    equippedBorder: response.data.equipped.border?.id || 'border-bronze',
                    equippedTheme: response.data.equipped.theme?.id || 'theme-default',
                    equippedBadges: response.data.equipped.badges?.map(b => b.id) || [],
                    level: response.data.level || 1
                };

                // Cache it
                setUserVaultCache(prev => ({
                    ...prev,
                    [userId]: vaultData
                }));

                return vaultData;
            }
        } catch (err) {
            console.error(`[VaultContext] Error fetching vault for user ${userId}:`, err);
            return {
                equippedBorder: 'border-bronze',
                equippedTheme: 'theme-default',
                equippedBadges: [],
                level: 1
            };
        }
    }, []); // No dependencies needed - uses ref for cache

    // Equip an item
    const equipItem = useCallback(async (itemId) => {
        try {
            const response = await api.post(`/vault/equip/${itemId}`);
            if (response.data.success) {
                const { equipped } = response.data;
                setEquippedBorder(equipped.border || 'border-bronze');
                setEquippedTheme(equipped.theme || 'theme-default');
                setEquippedBadges(equipped.badges || []);
                setActivePerks(equipped.perks || []);
                return { success: true, message: response.data.message };
            }
            return { success: false, message: 'Failed to equip item' };
        } catch (err) {
            console.error('[VaultContext] Error equipping item:', err);
            return { 
                success: false, 
                message: err.response?.data?.error || 'Failed to equip item' 
            };
        }
    }, []);

    // Unequip an item
    const unequipItem = useCallback(async (itemId) => {
        try {
            const response = await api.post(`/vault/unequip/${itemId}`);
            if (response.data.success) {
                const { equipped } = response.data;
                setEquippedBorder(equipped.border || 'border-bronze');
                setEquippedTheme(equipped.theme || 'theme-default');
                setEquippedBadges(equipped.badges || []);
                setActivePerks(equipped.perks || []);
                return { success: true, message: response.data.message };
            }
            return { success: false, message: 'Failed to unequip item' };
        } catch (err) {
            console.error('[VaultContext] Error unequipping item:', err);
            return { 
                success: false, 
                message: err.response?.data?.error || 'Failed to unequip item' 
            };
        }
    }, []);

    // Purchase an item
    const purchaseItem = useCallback(async (itemId) => {
        try {
            const response = await api.post(`/vault/purchase/${itemId}`);
            if (response.data.success) {
                // Add to owned items
                setOwnedItems(prev => [...prev, itemId]);
                return { 
                    success: true, 
                    message: response.data.message,
                    remainingCoins: response.data.remainingCoins
                };
            }
            return { success: false, message: 'Failed to purchase item' };
        } catch (err) {
            console.error('[VaultContext] Error purchasing item:', err);
            return { 
                success: false, 
                message: err.response?.data?.error || 'Failed to purchase item' 
            };
        }
    }, []);

    // Clear cache (useful when user logs out)
    const clearCache = useCallback(() => {
        setUserVaultCache({});
    }, []);

    // Refresh a specific user's vault (invalidate cache)
    const refreshUserVault = useCallback(async (userId) => {
        setUserVaultCache(prev => {
            const newCache = { ...prev };
            delete newCache[userId];
            return newCache;
        });
        return fetchUserVault(userId);
    }, [fetchUserVault]);

    // Initial fetch on auth
    useEffect(() => {
        if (isAuthenticated) {
            fetchEquipped();
        } else {
            // Reset to defaults when logged out
            setEquippedBorder('border-bronze');
            setEquippedTheme('theme-default');
            setEquippedBadges([]);
            setActivePerks([]);
            setOwnedItems(['border-bronze', 'theme-default']);
            clearCache();
        }
    }, [isAuthenticated, fetchEquipped, clearCache]);

    // Context value
    const value = {
        // Current user's equipped items
        equippedBorder,
        equippedTheme,
        equippedBadges,
        activePerks,
        ownedItems,
        
        // Loading/error state
        loading,
        error,
        
        // Actions
        equipItem,
        unequipItem,
        purchaseItem,
        
        // Fetch functions
        fetchEquipped,
        fetchVaultData,
        fetchUserVault,
        refreshUserVault,
        clearCache,
        
        // Cache
        userVaultCache
    };

    return (
        <VaultContext.Provider value={value}>
            {children}
        </VaultContext.Provider>
    );
};

// ============ HOOK ============
export const useVault = () => {
    const context = useContext(VaultContext);
    if (!context) {
        throw new Error('useVault must be used within a VaultProvider');
    }
    return context;
};

// ============ HELPER HOOK - Get vault for any user ============
// Use this in components that display other users (feed, leaderboard)
export const useUserVault = (userId) => {
    const { fetchUserVault, userVaultCache } = useVault();
    const [vault, setVault] = useState(null);
    const [loading, setLoading] = useState(true);
    // Use ref to track cache without causing re-renders
    const cacheRef = useRef(userVaultCache);
    cacheRef.current = userVaultCache;

    useEffect(() => {
        let isMounted = true;

        const loadVault = async () => {
            if (!userId) {
                if (isMounted) setLoading(false);
                return;
            }

            // Check cache first (using ref to avoid dependency)
            if (cacheRef.current[userId]) {
                if (isMounted) {
                    setVault(cacheRef.current[userId]);
                    setLoading(false);
                }
                return;
            }

            if (isMounted) setLoading(true);
            const data = await fetchUserVault(userId);
            if (isMounted) {
                setVault(data);
                setLoading(false);
            }
        };

        loadVault();

        return () => {
            isMounted = false;
        };
    }, [userId, fetchUserVault]);

    return { vault, loading };
};

export default VaultContext;