// src/components/Badges/BadgeUnlockModal.jsx
// Celebration modal when user earns a new badge

import React, { useState, useEffect } from 'react';
import BadgeIcon from '../BadgeIcon';
import './BadgeUnlockModal.css';

const BadgeUnlockModal = ({ badge, isOpen, onClose }) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            setAnimate(true);
            
            // Auto-close after 5 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        setShowConfetti(false);
        setAnimate(false);
        onClose();
    };

    if (!isOpen || !badge) return null;

    const getRarityInfo = (rarity) => {
        const info = {
            common: {
                title: 'Badge Unlocked!',
                color: '#94a3b8',
                gradient: 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)'
            },
            rare: {
                title: 'Rare Badge Unlocked!',
                color: '#3b82f6',
                gradient: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)'
            },
            epic: {
                title: 'Epic Badge Unlocked!',
                color: '#8b5cf6',
                gradient: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)'
            },
            legendary: {
                title: 'Legendary Badge Unlocked!',
                color: '#fbbf24',
                gradient: 'linear-gradient(135deg, #d97706 0%, #fef3c7 100%)'
            },
            mythic: {
                title: 'Mythic Badge Unlocked!',
                color: '#ec4899',
                gradient: 'linear-gradient(135deg, #db2777 0%, #f9a8d4 100%)'
            },
            origin: {
                title: 'Origin Badge Unlocked!',
                color: '#d4af37',
                gradient: 'linear-gradient(135deg, #92400e 0%, #fef3c7 100%)'
            }
        };
        return info[rarity] || info.common;
    };

    const rarityInfo = getRarityInfo(badge.rarity);

    return (
        <div className="badge-unlock-overlay" onClick={handleClose}>
            <div 
                className={`badge-unlock-modal ${badge.rarity} ${animate ? 'animate' : ''}`}
                onClick={(e) => e.stopPropagation()}
                style={{ background: rarityInfo.gradient }}
            >
                {showConfetti && <Confetti rarity={badge.rarity} />}

                <button className="close-button" onClick={handleClose}>×</button>

                <div className="unlock-content">
                    <h2 className="unlock-title">{rarityInfo.title}</h2>

                    <div className="badge-display">
                        <div className="badge-glow" style={{ 
                            boxShadow: `0 0 60px ${rarityInfo.color}` 
                        }}>
                            <BadgeIcon 
                                badgeId={badge.id} 
                                size={120} 
                                showParticles={true}
                            />
                        </div>
                    </div>

                    <h3 className="badge-name">{badge.name}</h3>
                    <p className="badge-description">{badge.description}</p>

                    <div className="badge-rewards">
                        {badge.xpReward && (
                            <div className="reward-item">
                                <span className="reward-icon">⭐</span>
                                <span className="reward-value">+{badge.xpReward} XP</span>
                            </div>
                        )}
                        {badge.coinReward && (
                            <div className="reward-item">
                                <span className="reward-icon">💰</span>
                                <span className="reward-value">+{badge.coinReward} Coins</span>
                            </div>
                        )}
                    </div>

                    <p className="unlock-message">
                        This {badge.rarity} badge has been added to your collection!
                    </p>
                </div>
            </div>
        </div>
    );
};

// Confetti Component with rarity-based colors
const Confetti = ({ rarity }) => {
    const getColors = (rarity) => {
        const colorSets = {
            common: ['#94a3b8', '#cbd5e1', '#e2e8f0'],
            rare: ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
            epic: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'],
            legendary: ['#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
            mythic: ['#ec4899', '#f472b6', '#f9a8d4', '#fce7f3'],
            origin: ['#d4af37', '#fbbf24', '#fef3c7', '#f8fafc']
        };
        return colorSets[rarity] || colorSets.common;
    };

    const colors = getColors(rarity);
    const particles = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div className="confetti-container">
            {particles.map(i => (
                <div
                    key={i}
                    className="confetti-piece"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        animationDuration: `${2 + Math.random() * 2}s`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)]
                    }}
                />
            ))}
        </div>
    );
};

export default BadgeUnlockModal;