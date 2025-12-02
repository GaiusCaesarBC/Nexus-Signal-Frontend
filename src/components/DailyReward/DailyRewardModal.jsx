// src/components/DailyReward/DailyRewardModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DailyRewardModal.css';

const DailyRewardModal = ({ isOpen, onClose, onClaimed }) => {
    const { api } = useAuth();
    const [loading, setLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [rewardData, setRewardData] = useState(null);
    const [claimedReward, setClaimedReward] = useState(null);
    const [error, setError] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Fetch reward status when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchRewardStatus();
        }
    }, [isOpen]);

    const fetchRewardStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/gamification/daily-reward/status');
            setRewardData(response.data);
        } catch (err) {
            console.error('Error fetching reward status:', err);
            setError('Failed to load reward information');
        } finally {
            setLoading(false);
        }
    };

    const handleClaimReward = async () => {
        try {
            setClaiming(true);
            setError(null);
            
            const response = await api.post('/gamification/daily-reward/claim');
            
            if (response.data.success) {
                setClaimedReward(response.data.reward);
                setShowConfetti(true);
                
                // Notify parent component
                if (onClaimed) {
                    onClaimed(response.data.reward);
                }
                
                // Auto-close after showing reward
                setTimeout(() => {
                    handleClose();
                }, 5000);
            }
        } catch (err) {
            console.error('Error claiming reward:', err);
            setError(err.response?.data?.error || 'Failed to claim reward');
        } finally {
            setClaiming(false);
        }
    };

    const handleClose = () => {
        setClaimedReward(null);
        setShowConfetti(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="daily-reward-overlay" onClick={handleClose}>
            <div className="daily-reward-modal" onClick={(e) => e.stopPropagation()}>
                {showConfetti && <Confetti />}
                
                <button className="close-button" onClick={handleClose}>×</button>
                
                {loading ? (
                    <div className="reward-loading">
                        <div className="spinner"></div>
                        <p>Loading your reward...</p>
                    </div>
                ) : error ? (
                    <div className="reward-error">
                        <h2>❌ Error</h2>
                        <p>{error}</p>
                        <button onClick={handleClose} className="btn-secondary">Close</button>
                    </div>
                ) : claimedReward ? (
                    <ClaimedRewardDisplay reward={claimedReward} />
                ) : rewardData ? (
                    <RewardPreview 
                        data={rewardData} 
                        onClaim={handleClaimReward}
                        claiming={claiming}
                    />
                ) : null}
            </div>
        </div>
    );
};

// Component to show reward preview before claiming
const RewardPreview = ({ data, onClaim, claiming }) => {
    const { canClaim, currentStreak, preview, nextMilestone, hoursUntilNext } = data;

    if (!canClaim) {
        return (
            <div className="reward-content">
                <h2>⏰ Already Claimed Today</h2>
                <p className="reward-message">
                    Come back in {hoursUntilNext} hour{hoursUntilNext !== 1 ? 's' : ''} for your next reward!
                </p>
                <div className="streak-info">
                    <div className="streak-display">
                        <span className="streak-icon">🔥</span>
                        <span className="streak-count">{currentStreak} Day Streak</span>
                    </div>
                </div>
                {nextMilestone && (
                    <div className="next-milestone">
                        <p>Next milestone in {nextMilestone.daysUntil} days:</p>
                        <p className="milestone-name">{nextMilestone.name}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="reward-content">
            <h2>🎁 Daily Reward</h2>
            
            <div className="streak-info">
                <div className="streak-display">
                    <span className="streak-icon">🔥</span>
                    <span className="streak-count">{currentStreak + 1} Day Streak</span>
                </div>
            </div>

            <div className="reward-preview">
                <h3>Today's Reward:</h3>
                <div className="preview-items">
                    {preview.xp && (
                        <div className="preview-item">
                            <span className="item-icon">⭐</span>
                            <span className="item-value">{preview.xp} XP</span>
                        </div>
                    )}
                    {preview.coins && (
                        <div className="preview-item">
                            <span className="item-icon">💰</span>
                            <span className="item-value">{preview.coins} Coins</span>
                        </div>
                    )}
                    {preview.items && preview.items.length > 0 && (
                        <div className="preview-item">
                            <span className="item-icon">🎨</span>
                            <span className="item-value">{preview.items.length} Item{preview.items.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {preview.type === 'milestone' && (
                    <div className="milestone-badge">
                        🎉 MILESTONE: {preview.milestoneName}
                    </div>
                )}

                {preview.type === 'jackpot' && (
                    <div className="jackpot-badge">
                        🎰 JACKPOT DAY!
                    </div>
                )}
            </div>

            {nextMilestone && (
                <div className="next-milestone">
                    <p>Next milestone in {nextMilestone.daysUntil} day{nextMilestone.daysUntil !== 1 ? 's' : ''}:</p>
                    <p className="milestone-name">{nextMilestone.name}</p>
                </div>
            )}

            <button 
                onClick={onClaim} 
                disabled={claiming}
                className="claim-button"
            >
                {claiming ? 'Claiming...' : 'Claim Reward'}
            </button>
        </div>
    );
};

// Component to show claimed reward with animation
const ClaimedRewardDisplay = ({ reward }) => {
    return (
        <div className="reward-content reward-claimed">
            <h2>🎉 Reward Claimed!</h2>
            
            <div className="claimed-items">
                {reward.xp && (
                    <div className="claimed-item xp-item">
                        <span className="item-icon">⭐</span>
                        <span className="item-label">XP Earned</span>
                        <span className="item-value">+{reward.xp}</span>
                    </div>
                )}
                
                {reward.coins && (
                    <div className="claimed-item coins-item">
                        <span className="item-icon">💰</span>
                        <span className="item-label">Coins Earned</span>
                        <span className="item-value">+{reward.coins}</span>
                    </div>
                )}
                
                {reward.newItems && reward.newItems.length > 0 && (
                    <div className="claimed-item items-section">
                        <span className="item-icon">🎨</span>
                        <span className="item-label">New Items Unlocked</span>
                        <div className="unlocked-items">
                            {reward.newItems.map((item, index) => (
                                <div key={index} className="unlocked-item">
                                    {formatItemName(item)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="streak-display large">
                <span className="streak-icon">🔥</span>
                <span className="streak-count">{reward.streak} Day Streak</span>
            </div>

            {reward.type === 'milestone' && (
                <div className="milestone-celebration">
                    <h3>🏆 Milestone Achieved!</h3>
                    <p>{reward.milestoneName}</p>
                </div>
            )}

            {reward.type === 'jackpot' && (
                <div className="jackpot-celebration">
                    <h3>🎰 JACKPOT!</h3>
                    <p>You hit the daily jackpot!</p>
                </div>
            )}

            <p className="claim-message">Great job! Come back tomorrow for more rewards!</p>
        </div>
    );
};

// Simple confetti component
const Confetti = () => {
    return (
        <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
                <div 
                    key={i} 
                    className="confetti-piece"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'][Math.floor(Math.random() * 5)]
                    }}
                />
            ))}
        </div>
    );
};

// Helper to format item names
const formatItemName = (itemId) => {
    return itemId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default DailyRewardModal;