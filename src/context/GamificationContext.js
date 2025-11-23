// client/src/context/GamificationContext.js - FIXED INFINITE LOOP
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const GamificationContext = createContext();

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within GamificationProvider');
    }
    return context;
};

export const GamificationProvider = ({ children }) => {
    const { api, isAuthenticated } = useAuth();
    const toast = useToast();
    
    const [gamificationData, setGamificationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpData, setLevelUpData] = useState(null);
    const [newAchievements, setNewAchievements] = useState([]);
    const [showAchievement, setShowAchievement] = useState(false);
    const [currentAchievement, setCurrentAchievement] = useState(null);

    // ✅ FIXED: Removed gamificationData from dependencies to prevent infinite loop
    const fetchGamificationData = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        
        try {
            console.log('🎮 GamificationContext: Fetching data...');
            const response = await api.get('/gamification/stats');
            
            if (response.data.success) {
                const newData = response.data.data;
                console.log('🎮 GamificationContext: Data received:', newData);
                console.log('🎮 GamificationContext: Equipped items:', newData.equippedItems);
                
                // Check for level up (only if we have previous data)
                setGamificationData(prevData => {
                    if (prevData) {
                        const oldLevel = prevData.level || 1;
                        const newLevel = newData.level;
                        
                        if (newLevel > oldLevel) {
                            setLevelUpData({
                                oldLevel,
                                newLevel,
                                rank: newData.rank,
                                coinReward: (newLevel - oldLevel) * 100
                            });
                            setShowLevelUp(true);
                            setTimeout(() => setShowLevelUp(false), 5000);
                        }
                    }
                    return newData;
                });
            }
        } catch (error) {
            console.error('❌ GamificationContext: Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [api, isAuthenticated]); // ✅ FIXED: Only depend on api and isAuthenticated

    // Check in (daily streak)
    const checkIn = async () => {
        try {
            const response = await api.post('/gamification/login-streak');
            
            if (response.data.success) {
                await fetchGamificationData();
                
                if (response.data.broken) {
                    toast.warning('Your streak was broken!', 'Streak Reset');
                } else if (response.data.isNew) {
                    toast.success(`${response.data.streak} day streak! 🔥`, 'Daily Check-in');
                }
                
                return response.data;
            }
        } catch (error) {
            console.error('Error checking in:', error);
            toast.error('Failed to check in', 'Error');
        }
    };

    // Award XP manually
    const awardXP = async (amount, reason) => {
        try {
            const response = await api.post('/gamification/award-xp', {
                amount,
                reason
            });
            
            if (response.data.success) {
                await fetchGamificationData();
                
                if (response.data.leveledUp) {
                    toast.success(`Level Up! You're now level ${response.data.newLevel}!`, 'Congratulations! 🎉');
                } else {
                    toast.success(`+${amount} XP`, reason);
                }
                
                return response.data;
            }
        } catch (error) {
            console.error('Error awarding XP:', error);
        }
    };

    // Show achievement popup
    const showAchievementPopup = (achievement) => {
        setCurrentAchievement(achievement);
        setShowAchievement(true);
        setTimeout(() => {
            setShowAchievement(false);
            setCurrentAchievement(null);
        }, 5000);
    };

    // ✅ FIXED: Fetch data on mount only
    useEffect(() => {
        if (isAuthenticated) {
            console.log('🎮 GamificationContext: User authenticated, fetching data...');
            fetchGamificationData();
        } else {
            console.log('🎮 GamificationContext: User not authenticated');
            setLoading(false);
        }
    }, [isAuthenticated, fetchGamificationData]);

    // ✅ FIXED: Auto-refresh without dependencies on fetchGamificationData
    useEffect(() => {
        if (!isAuthenticated) return;
        
        console.log('🎮 GamificationContext: Setting up auto-refresh (every 60 seconds)');
        const interval = setInterval(() => {
            console.log('🎮 GamificationContext: Auto-refreshing...');
            fetchGamificationData();
        }, 60000); // ✅ Changed to 60 seconds instead of 30
        
        return () => {
            console.log('🎮 GamificationContext: Cleaning up auto-refresh');
            clearInterval(interval);
        };
    }, [isAuthenticated, fetchGamificationData]);

    const value = {
        gamification: gamificationData,
        gamificationData,
        loading,
        refreshGamification: fetchGamificationData,
        fetchGamificationData,
        checkIn,
        awardXP,
        showLevelUp,
        setShowLevelUp,
        levelUpData,
        showAchievement,
        setShowAchievement,
        currentAchievement
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};