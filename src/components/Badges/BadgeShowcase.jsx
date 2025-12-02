// src/components/Badges/BadgeShowcase.jsx
// Complete badge showcase with filters and progress tracking

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import BadgeIcon from '../BadgeIcon'; // Your existing component
import './BadgeShowcase.css';

const BadgeShowcase = () => {
    const { api } = useAuth();
    const [loading, setLoading] = useState(true);
    const [badges, setBadges] = useState([]);
    const [filter, setFilter] = useState('all'); // all, earned, locked
    const [rarityFilter, setRarityFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        earned: 0,
        locked: 0
    });

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            setLoading(true);
            const response = await api.get('/gamification/badges');
            
            if (response.data.success) {
                setBadges(response.data.badges);
                setStats({
                    total: response.data.totalBadges,
                    earned: response.data.earnedCount,
                    locked: response.data.totalBadges - response.data.earnedCount
                });
            }
        } catch (error) {
            console.error('Error fetching badges:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBadges = badges.filter(badge => {
        // Status filter
        if (filter === 'earned' && !badge.earned) return false;
        if (filter === 'locked' && badge.earned) return false;

        // Rarity filter
        if (rarityFilter !== 'all' && badge.rarity !== rarityFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && badge.category !== categoryFilter) return false;

        return true;
    });

    const rarityOrder = ['common', 'rare', 'epic', 'legendary', 'mythic', 'origin'];
    const sortedBadges = [...filteredBadges].sort((a, b) => {
        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });

    if (loading) {
        return (
            <div className="badge-showcase">
                <div className="loading">Loading badges...</div>
            </div>
        );
    }

    return (
        <div className="badge-showcase">
            {/* Header with Stats */}
            <div className="showcase-header">
                <h2>Badge Collection</h2>
                <div className="badge-stats">
                    <div className="stat">
                        <span className="stat-value">{stats.earned}</span>
                        <span className="stat-label">Earned</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{stats.locked}</span>
                        <span className="stat-label">Locked</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">
                            {stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0}%
                        </span>
                        <span className="stat-label">Complete</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="showcase-filters">
                <div className="filter-group">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        All ({stats.total})
                    </button>
                    <button
                        className={filter === 'earned' ? 'active' : ''}
                        onClick={() => setFilter('earned')}
                    >
                        Earned ({stats.earned})
                    </button>
                    <button
                        className={filter === 'locked' ? 'active' : ''}
                        onClick={() => setFilter('locked')}
                    >
                        Locked ({stats.locked})
                    </button>
                </div>

                <div className="filter-group">
                    <select 
                        value={rarityFilter}
                        onChange={(e) => setRarityFilter(e.target.value)}
                        className="rarity-filter"
                    >
                        <option value="all">All Rarities</option>
                        <option value="common">Common</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                        <option value="mythic">Mythic</option>
                        <option value="origin">Origin</option>
                    </select>

                    <select 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="category-filter"
                    >
                        <option value="all">All Categories</option>
                        <option value="trading">Trading</option>
                        <option value="streak">Streaks</option>
                        <option value="portfolio">Portfolio</option>
                        <option value="predictions">Predictions</option>
                        <option value="level">Levels</option>
                        <option value="special">Special</option>
                    </select>
                </div>
            </div>

            {/* Badge Grid */}
            <div className="badge-grid">
                {sortedBadges.map(badge => (
                    <BadgeCard key={badge.id} badge={badge} />
                ))}
            </div>

            {sortedBadges.length === 0 && (
                <div className="no-badges">
                    <p>No badges match your filters</p>
                </div>
            )}
        </div>
    );
};

// Individual Badge Card Component
const BadgeCard = ({ badge }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const getRarityColor = (rarity) => {
        const colors = {
            common: '#94a3b8',
            rare: '#3b82f6',
            epic: '#8b5cf6',
            legendary: '#fbbf24',
            mythic: '#ec4899',
            origin: '#d4af37'
        };
        return colors[rarity] || '#94a3b8';
    };

    return (
        <div 
            className={`badge-card ${badge.earned ? 'earned' : 'locked'} ${badge.rarity}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Lock Overlay for Locked Badges */}
            {!badge.earned && <div className="lock-overlay">🔒</div>}

            {/* Badge Icon */}
            <div className="badge-icon-container">
                <BadgeIcon 
                    badgeId={badge.id} 
                    size={80} 
                    showParticles={badge.earned}
                />
            </div>

            {/* Badge Info */}
            <div className="badge-info">
                <h3 className="badge-name">{badge.name}</h3>
                <span 
                    className="badge-rarity"
                    style={{ color: getRarityColor(badge.rarity) }}
                >
                    {badge.rarity.toUpperCase()}
                </span>
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div className="badge-tooltip">
                    <h4>{badge.name}</h4>
                    <p className="badge-description">{badge.description}</p>
                    <div className="badge-rewards">
                        {badge.xpReward && (
                            <span className="reward">⭐ {badge.xpReward} XP</span>
                        )}
                        {badge.coinReward && (
                            <span className="reward">💰 {badge.coinReward} Coins</span>
                        )}
                    </div>
                    {badge.earned && badge.earnedDate && (
                        <p className="earned-date">
                            Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                        </p>
                    )}
                    {!badge.earned && (
                        <p className="locked-hint">Complete the requirements to unlock!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BadgeShowcase;