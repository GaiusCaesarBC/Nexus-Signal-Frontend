// src/components/FollowButton.js - Reusable Follow Button Component

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import usersAPI from '../api/users';

const Button = styled.button`
    padding: 10px 24px;
    border-radius: 8px;
    border: 2px solid;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    
    ${props => props.$isFollowing ? `
        background: transparent;
        border-color: ${props.theme.colors.primary || '#3b82f6'};
        color: ${props.theme.colors.primary || '#3b82f6'};
        
        &:hover {
            background: ${props.theme.colors.danger || '#ef4444'};
            border-color: ${props.theme.colors.danger || '#ef4444'};
            color: white;
        }
    ` : `
        background: ${props.theme.colors.primary || '#3b82f6'};
        border-color: ${props.theme.colors.primary || '#3b82f6'};
        color: white;
        
        &:hover {
            background: ${props.theme.colors.primaryDark || '#2563eb'};
            border-color: ${props.theme.colors.primaryDark || '#2563eb'};
        }
    `}
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    &:active {
        transform: scale(0.98);
    }
`;

const FollowButton = ({ userId, initialFollowing = false, onFollowChange, showCount = true }) => {
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hovered, setHovered] = useState(false);

    // Check follow status on mount if not provided
    useEffect(() => {
        if (userId && !initialFollowing) {
            checkFollowStatus();
        }
    }, [userId]);

    const checkFollowStatus = async () => {
        try {
            const data = await usersAPI.isFollowing(userId);
            setIsFollowing(data.isFollowing);
        } catch (err) {
            console.error('Error checking follow status:', err);
        }
    };

    const handleFollowToggle = async () => {
        if (loading) return;
        
        setLoading(true);
        setError(null);

        try {
            if (isFollowing) {
                await usersAPI.unfollowUser(userId);
                setIsFollowing(false);
                if (onFollowChange) onFollowChange(false);
            } else {
                await usersAPI.followUser(userId);
                setIsFollowing(true);
                if (onFollowChange) onFollowChange(true);
            }
        } catch (err) {
            console.error('Error toggling follow:', err);
            setError(err.response?.data?.msg || 'Failed to update follow status');
            
            // Show error briefly then clear
            setTimeout(() => setError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (loading) return '...';
        if (error) return 'Error';
        if (isFollowing) {
            return hovered ? 'Unfollow' : 'Following';
        }
        return 'Follow';
    };

    return (
        <Button
            $isFollowing={isFollowing}
            onClick={handleFollowToggle}
            disabled={loading || error}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={error || undefined}
        >
            {!loading && (
                <span>{isFollowing ? '✓' : '+'}</span>
            )}
            {getButtonText()}
        </Button>
    );
};

export default FollowButton;