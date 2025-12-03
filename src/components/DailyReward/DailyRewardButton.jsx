// src/components/DailyReward/DailyRewardButton.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DailyRewardButton.css';

const DailyRewardButton = ({ onClick }) => {
    const { api } = useAuth();
    const [rewardAvailable, setRewardAvailable] = useState(false);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    const checkRewardStatus = useCallback(async () => {
        try {
            const response = await api.get('/gamification/daily-reward/status');
            setRewardAvailable(response.data.canClaim);
            setStreak(response.data.currentStreak || 0);
        } catch (err) {
            console.error('Error checking reward status:', err);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        checkRewardStatus();

        // Check every 5 minutes
        const interval = setInterval(checkRewardStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [checkRewardStatus]);

    if (loading) return null;

    return (
        <button
            className={`daily-reward-button ${rewardAvailable ? 'available' : 'claimed'}`}
            onClick={onClick}
            title={rewardAvailable ? 'Claim your daily reward!' : 'Already claimed today'}
        >
            <div className="reward-icon">
                {rewardAvailable ? '🎁' : '✓'}
            </div>
            <div className="reward-info">
                <span className="reward-label">
                    {rewardAvailable ? 'Daily Reward' : 'Claimed Today'}
                </span>
                {streak != null && streak > 0 && (
                    <span className="reward-streak">
                        🔥 {streak} day{streak !== 1 ? 's' : ''}
                    </span>
                )}
            </div>
            {rewardAvailable && (
                <div className="pulse-ring"></div>
            )}
        </button>
    );
};

export default DailyRewardButton;