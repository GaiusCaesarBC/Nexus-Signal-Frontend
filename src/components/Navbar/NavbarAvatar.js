// client/src/components/navbar/NavbarAvatar.js
// Avatar component for the navbar with equipped border
// Drop this into your existing Navbar component

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useVault } from '../../context/VaultContext';
import AvatarWithBorder from '../vault/AvatarWithBorder';
import BadgeDisplay from '../vault/BadgeDisplay';

const AvatarContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 12px;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(0, 173, 239, 0.1);
    }
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    
    @media (max-width: 768px) {
        display: none;
    }
`;

const Username = styled.span`
    font-weight: 600;
    color: #f8fafc;
    font-size: 0.9rem;
`;

const Level = styled.span`
    font-size: 0.75rem;
    color: #a78bfa;
    font-weight: 600;
`;

const BadgesContainer = styled.div`
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    
    @media (max-width: 768px) {
        display: none;
    }
`;

const NavbarAvatar = ({ showUsername = true, showBadges = false, size = 40 }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { equippedBorder, equippedBadges, loading } = useVault();
    
    if (!user) return null;
    
    const handleClick = () => {
        navigate('/profile');
    };
    
    return (
        <AvatarContainer onClick={handleClick}>
            {showUsername && (
                <UserInfo>
                    <Username>{user.name || user.username}</Username>
                    <Level>Level {user.level || 1}</Level>
                </UserInfo>
            )}
            
            <AvatarWithBorder
                src={user.avatar || user.profile?.avatar}
                name={user.name}
                username={user.username}
                size={size}
                borderId={loading ? 'border-bronze' : equippedBorder}
                showLevel={false}
            />
            
            {showBadges && equippedBadges.length > 0 && (
                <BadgesContainer>
                    <BadgeDisplay
                        badges={equippedBadges}
                        maxDisplay={3}
                        size={18}
                        rounded
                        showTooltip={false}
                    />
                </BadgesContainer>
            )}
        </AvatarContainer>
    );
};

export default NavbarAvatar;