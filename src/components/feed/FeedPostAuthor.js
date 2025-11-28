// client/src/components/feed/FeedPostAuthor.js
// Author display for feed posts with vault integration
// Replace your existing author section in FeedPost or PostCard components

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import AvatarWithBorder from '../vault/AvatarWithBorder';
import BadgeDisplay from '../vault/BadgeDisplay';
import api from '../../api/axios';

const AuthorContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: opacity 0.2s ease;
    
    &:hover {
        opacity: 0.9;
    }
`;

const AuthorInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const AuthorName = styled.span`
    font-weight: 700;
    color: #f8fafc;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    &:hover {
        color: #00adef;
    }
`;

const LevelBadge = styled.span`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #a78bfa;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 6px;
    white-space: nowrap;
`;

const BottomRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Username = styled.span`
    color: #64748b;
    font-size: 0.85rem;
`;

const Timestamp = styled.span`
    color: #475569;
    font-size: 0.8rem;
    
    &::before {
        content: '•';
        margin-right: 0.5rem;
    }
`;

const BadgesRow = styled.div`
    display: flex;
    align-items: center;
    margin-top: 0.25rem;
`;

// Helper to format relative time
const formatRelativeTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
};

const FeedPostAuthor = ({ 
    author,
    timestamp,
    showBadges = true,
    showLevel = true,
    avatarSize = 46
}) => {
    const navigate = useNavigate();
    const [vaultData, setVaultData] = useState(null);
    const [vaultLoading, setVaultLoading] = useState(true);
    
    // Extract author info
    const authorId = author?._id || author?.id;
    const authorName = author?.name || author?.displayName || 'Anonymous';
    const authorUsername = author?.username;
    const authorAvatar = author?.profile?.avatar || author?.avatar;
    const authorLevel = author?.gamification?.level || author?.level || 1;
    
    // Fetch vault data for this author
    useEffect(() => {
        const fetchVault = async () => {
            if (!authorId) {
                setVaultLoading(false);
                return;
            }
            
            try {
                const response = await api.get(`/vault/user/${authorId}`);
                if (response.data.success) {
                    setVaultData({
                        equippedBorder: response.data.equipped.border?.id || 'border-bronze',
                        equippedBadges: response.data.equipped.badges?.map(b => b.id) || [],
                        level: response.data.level || authorLevel
                    });
                }
            } catch (err) {
                console.log('Could not fetch vault for author:', err.message);
            } finally {
                setVaultLoading(false);
            }
        };
        
        fetchVault();
    }, [authorId, authorLevel]);
    
    const handleClick = (e) => {
        e.stopPropagation();
        if (authorId) {
            navigate(`/profile/${authorId}`);
        } else if (authorUsername) {
            navigate(`/user/${authorUsername}`);
        }
    };
    
    const equippedBorder = vaultData?.equippedBorder || 'border-bronze';
    const equippedBadges = vaultData?.equippedBadges || [];
    const level = vaultData?.level || authorLevel;
    
    return (
        <AuthorContainer onClick={handleClick}>
            <AvatarWithBorder
                src={authorAvatar}
                name={authorName}
                username={authorUsername}
                size={avatarSize}
                borderId={vaultLoading ? 'border-bronze' : equippedBorder}
            />
            
            <AuthorInfo>
                <TopRow>
                    <AuthorName>{authorName}</AuthorName>
                    {showLevel && (
                        <LevelBadge>Lv.{level}</LevelBadge>
                    )}
                </TopRow>
                
                <BottomRow>
                    {authorUsername && <Username>@{authorUsername}</Username>}
                    {timestamp && <Timestamp>{formatRelativeTime(timestamp)}</Timestamp>}
                </BottomRow>
                
                {showBadges && equippedBadges.length > 0 && (
                    <BadgesRow>
                        <BadgeDisplay
                            badges={equippedBadges}
                            maxDisplay={3}
                            size={22}
                            showTooltip={true}
                        />
                    </BadgesRow>
                )}
            </AuthorInfo>
        </AuthorContainer>
    );
};

export default FeedPostAuthor;

// ============ USAGE EXAMPLE ============
/*
Replace your existing author section in FeedPost/PostCard:

BEFORE:
<AuthorSection>
    <Avatar src={post.author.avatar} />
    <AuthorName>{post.author.name}</AuthorName>
    <Username>@{post.author.username}</Username>
</AuthorSection>

AFTER:
import FeedPostAuthor from '../components/feed/FeedPostAuthor';

<FeedPostAuthor
    author={post.author}
    timestamp={post.createdAt}
    showBadges={true}
    showLevel={true}
/>
*/