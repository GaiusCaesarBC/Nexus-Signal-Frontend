// client/src/context/GamificationContext.js
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

    // Fetch gamification data
    const fetchGamificationData = useCallback(async () => {
        if (!isAuthenticated) return;
        
        try {
            const response = await api.get('/gamification');
            
            if (response.data.success) {
                const oldLevel = gamificationData?.level || 1;
                const newLevel = response.data.level;
                
                // Check if user leveled up
                if (newLevel > oldLevel && gamificationData !== null) {
                    setLevelUpData({
                        oldLevel,
                        newLevel,
                        rank: response.data.rank,
                        coinReward: (newLevel - oldLevel) * 100
                    });
                    setShowLevelUp(true);
                    
                    // Auto-hide after 5 seconds
                    setTimeout(() => setShowLevelUp(false), 5000);
                }
                
                setGamificationData(response.data);
            }
        } catch (error) {
            console.error('Error fetching gamification data:', error);
        } finally {
            setLoading(false);
        }
    }, [api, isAuthenticated, gamificationData]);

    // Check in (daily streak)
    const checkIn = async () => {
        try {
            const response = await api.post('/gamification/check-in');
            
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

    // Award XP manually (for testing or special events)
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
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            setShowAchievement(false);
            setCurrentAchievement(null);
        }, 5000);
    };

    // Listen for new achievements
    useEffect(() => {
        if (gamificationData && gamificationData.achievements) {
            const previousAchievementIds = newAchievements.map(a => a.id);
            const currentAchievements = gamificationData.achievements;
            
            // Find newly unlocked achievements
            const newlyUnlocked = currentAchievements.filter(
                achievement => !previousAchievementIds.includes(achievement.id)
            );
            
            if (newlyUnlocked.length > 0 && newAchievements.length > 0) {
                // Show popup for each new achievement (with delay)
                newlyUnlocked.forEach((achievement, index) => {
                    setTimeout(() => {
                        showAchievementPopup(achievement);
                        toast.success(`Achievement Unlocked: ${achievement.name}!`, achievement.icon);
                    }, index * 3000);
                });
            }
            
            setNewAchievements(currentAchievements);
        }
    }, [gamificationData]);

    // Fetch data on mount and when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchGamificationData();
        }
    }, [isAuthenticated]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!isAuthenticated) return;
        
        const interval = setInterval(() => {
            fetchGamificationData();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchGamificationData]);

    const value = {
        gamificationData,
        loading,
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