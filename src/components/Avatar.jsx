// client/src/components/Avatar.jsx - Reusable Avatar Component with Border Support
// Now uses equipped border from user's vault!

import React from 'react';
import AvatarWithBorder from './vault/AvatarWithBorder';

const Avatar = ({ 
    src, 
    alt = 'User avatar', 
    size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl' or number
    username = '',
    name = '',
    className = '',
    onClick = null,
    // Border props
    borderId = null,
    equippedBorder = null,
    showOnline = false,
    isOnline = false,
    showLevel = false,
    level = 1,
    showParticles = true
}) => {
    // Size configurations - convert to pixels
    const sizeMap = {
        xs: 24,
        sm: 32,
        md: 40,
        lg: 64,
        xl: 96
    };

    // Get pixel size
    const pixelSize = typeof size === 'number' ? size : (sizeMap[size] || sizeMap.md);

    // Determine which border to use
    const borderToUse = borderId || equippedBorder || 'border-bronze';

    return (
        <AvatarWithBorder
            src={src}
            name={name || alt}
            username={username}
            size={pixelSize}
            borderId={borderToUse}
            showOnline={showOnline}
            isOnline={isOnline}
            showLevel={showLevel}
            level={level}
            showParticles={showParticles}
            onClick={onClick}
            className={className}
        />
    );
};

export default Avatar;