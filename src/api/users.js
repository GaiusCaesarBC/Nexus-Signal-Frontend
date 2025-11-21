// src/api/users.js - User & Social Features API

import API from './axios';

const usersAPI = {
    // ================================
    // PROFILE ENDPOINTS
    // ================================

    /**
     * Get public profile by username
     * @param {string} username - Username to fetch
     * @returns {Promise} User profile data
     */
    getProfileByUsername: async (username) => {
        try {
            const response = await API.get(`/users/profile/${username}`);
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching profile:', error);
            throw error;
        }
    },

    /**
     * Get current user's full profile
     * @returns {Promise} Full user profile with all data
     */
    getMyFullProfile: async () => {
        try {
            const response = await API.get('/users/me/full');
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching own profile:', error);
            throw error;
        }
    },

    /**
     * Update current user's profile
     * @param {Object} profileData - Profile fields to update
     * @returns {Promise} Updated profile data
     */
    updateProfile: async (profileData) => {
        try {
            const response = await API.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            console.error('[API] Error updating profile:', error);
            throw error;
        }
    },

    // ================================
    // FOLLOW SYSTEM
    // ================================

    /**
     * Follow a user
     * @param {string} userId - ID of user to follow
     * @returns {Promise} Follow status
     */
    followUser: async (userId) => {
        try {
            const response = await API.post(`/users/follow/${userId}`);
            return response.data;
        } catch (error) {
            console.error('[API] Error following user:', error);
            throw error;
        }
    },

    /**
     * Unfollow a user
     * @param {string} userId - ID of user to unfollow
     * @returns {Promise} Follow status
     */
    unfollowUser: async (userId) => {
        try {
            const response = await API.delete(`/users/follow/${userId}`);
            return response.data;
        } catch (error) {
            console.error('[API] Error unfollowing user:', error);
            throw error;
        }
    },

    /**
     * Check if current user is following another user
     * @param {string} userId - ID of user to check
     * @returns {Promise} { isFollowing: boolean }
     */
    isFollowing: async (userId) => {
        try {
            const response = await API.get(`/users/${userId}/is-following`);
            return response.data;
        } catch (error) {
            console.error('[API] Error checking follow status:', error);
            throw error;
        }
    },

    /**
     * Get user's followers list
     * @param {string} userId - User ID
     * @returns {Promise} Array of followers
     */
    getFollowers: async (userId) => {
        try {
            const response = await API.get(`/users/${userId}/followers`);
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching followers:', error);
            throw error;
        }
    },

    /**
     * Get user's following list
     * @param {string} userId - User ID
     * @returns {Promise} Array of users being followed
     */
    getFollowing: async (userId) => {
        try {
            const response = await API.get(`/users/${userId}/following`);
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching following:', error);
            throw error;
        }
    },

    // ================================
    // DISCOVERY & SEARCH
    // ================================

    /**
     * Discover top traders
     * @param {number} limit - Number of users to fetch
     * @returns {Promise} Array of top traders
     */
    discoverUsers: async (limit = 20) => {
        try {
            const response = await API.get(`/users/discover?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('[API] Error discovering users:', error);
            throw error;
        }
    },

    /**
     * Search users by username or display name
     * @param {string} query - Search query
     * @returns {Promise} Array of matching users
     */
    searchUsers: async (query) => {
        try {
            const response = await API.get(`/users/search?q=${encodeURIComponent(query)}`);
            return response.data;
        } catch (error) {
            console.error('[API] Error searching users:', error);
            throw error;
        }
    },

    /**
     * Get leaderboard
     * @param {Object} options - { sortBy, limit, timeframe }
     * @returns {Promise} Array of top users
     */
    getLeaderboard: async ({ sortBy = 'totalReturnPercent', limit = 50, timeframe = 'all' } = {}) => {
        try {
            const response = await API.get(`/users/leaderboard?sortBy=${sortBy}&limit=${limit}&timeframe=${timeframe}`);
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching leaderboard:', error);
            throw error;
        }
    },

    // ================================
    // STATS & ACHIEVEMENTS
    // ================================

    /**
     * Refresh current user's trading stats
     * @returns {Promise} Updated stats
     */
    refreshStats: async () => {
        try {
            const response = await API.post('/users/stats/refresh');
            return response.data;
        } catch (error) {
            console.error('[API] Error refreshing stats:', error);
            throw error;
        }
    },

    /**
     * Get user's statistics
     * @param {string} userId - User ID
     * @returns {Promise} User stats
     */
    getUserStats: async (userId) => {
        try {
            const response = await API.get(`/users/${userId}/stats`);
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching user stats:', error);
            throw error;
        }
    },

    /**
     * Get user's achievements
     * @param {string} userId - User ID
     * @returns {Promise} Achievements and badges
     */
    getAchievements: async (userId) => {
        try {
            const response = await API.get(`/users/${userId}/achievements`);
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching achievements:', error);
            throw error;
        }
    },

    /**
     * Add XP to current user
     * @param {number} amount - XP amount to add
     * @param {string} reason - Reason for XP gain
     * @returns {Promise} Updated XP and level
     */
    addXP: async (amount, reason) => {
        try {
            const response = await API.post('/users/xp/add', { amount, reason });
            return response.data;
        } catch (error) {
            console.error('[API] Error adding XP:', error);
            throw error;
        }
    },

    // ================================
    // UTILITY
    // ================================

    /**
     * Get multiple users by IDs
     * @param {Array<string>} userIds - Array of user IDs
     * @returns {Promise} Array of users
     */
    getBatchUsers: async (userIds) => {
        try {
            const ids = userIds.join(',');
            const response = await API.get(`/users/batch?ids=${ids}`);
            return response.data;
        } catch (error) {
            console.error('[API] Error fetching batch users:', error);
            throw error;
        }
    },
};

export default usersAPI;