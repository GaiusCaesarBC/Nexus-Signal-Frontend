// client/src/components/Avatar.jsx - Reusable Avatar Component

import React from 'react';

const Avatar = ({ 
    src, 
    alt = 'User avatar', 
    size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
    username = '',
    className = '',
    onClick = null
}) => {
    // Size configurations
    const sizeClasses = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl'
    };

    // Generate initials from username
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Generate color from username (consistent color for same username)
    const getColorFromUsername = (name) => {
        if (!name) return '#667eea';
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#4facfe',
            '#43e97b', '#fa709a', '#fee140', '#30cfd0',
            '#a8edea', '#fed6e3', '#c471f5', '#12c2e9'
        ];
        return colors[Math.abs(hash) % colors.length];
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const backgroundColor = getColorFromUsername(username);

    return (
        <div
            className={`avatar-container ${sizeClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            style={{ backgroundColor: src ? 'transparent' : backgroundColor }}
        >
            {src ? (
                <img 
                    src={src} 
                    alt={alt}
                    className="avatar-image"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            <div 
                className="avatar-initials"
                style={{ display: src ? 'none' : 'flex' }}
            >
                {getInitials(username || alt)}
            </div>

            <style jsx>{`
                .avatar-container {
                    position: relative;
                    border-radius: 50%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .avatar-container:hover {
                    transform: scale(1.05);
                }

                .avatar-container.cursor-pointer:hover {
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
                }

                .avatar-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-initials {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    user-select: none;
                }
            `}</style>
        </div>
    );
};

export default Avatar;