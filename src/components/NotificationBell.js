// client/src/components/NotificationBell.js - Notification Bell with Badge

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Bell, X, Check, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Animations
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
`;

const slideDown = keyframes`
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const BellContainer = styled.div`
    position: relative;
`;

const BellButton = styled.button`
    position: relative;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #00adef;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        border-color: rgba(0, 173, 237, 0.5);
        transform: translateY(-2px);
    }

    ${props => props.$hasUnread && `
        animation: ${pulse} 2s ease-in-out infinite;
    `}
`;

const Badge = styled.div`
    position: absolute;
    top: -6px;
    right: -6px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border-radius: 12px;
    min-width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0 6px;
    border: 2px solid #0a0e27;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const Dropdown = styled.div`
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 420px;
    max-height: 600px;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    z-index: 1000;
    animation: ${slideDown} 0.3s ease-out;

    @media (max-width: 768px) {
        width: 340px;
        max-height: 500px;
    }
`;

const Header = styled.div`
    padding: 1.5rem;
    border-bottom: 1px solid rgba(0, 173, 237, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Title = styled.h3`
    color: #00adef;
    font-size: 1.2rem;
    font-weight: 700;
    margin: 0;
`;

const Actions = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const ActionButton = styled.button`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    color: #00adef;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.3rem;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-1px);
    }
`;

const NotificationList = styled.div`
    max-height: 460px;
    overflow-y: auto;
    padding: 0.5rem;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.05);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.3);
        border-radius: 4px;

        &:hover {
            background: rgba(0, 173, 237, 0.5);
        }
    }
`;

const NotificationItem = styled.div`
    background: ${props => props.$unread ? 
        'rgba(0, 173, 237, 0.1)' : 
        'rgba(0, 173, 237, 0.05)'
    };
    border: 1px solid ${props => props.$unread ? 
        'rgba(0, 173, 237, 0.3)' : 
        'rgba(0, 173, 237, 0.15)'
    };
    border-left: 3px solid ${props => {
        if (props.$type === 'alert_triggered') return '#00adef';
        if (props.$type === 'prediction_expiry') return '#f59e0b';
        if (props.$type === 'achievement_unlocked') return '#10b981';
        return '#8b5cf6';
    }};
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: ${fadeIn} 0.3s ease-out;

    &:hover {
        transform: translateX(-4px);
        border-color: rgba(0, 173, 237, 0.5);
        background: rgba(0, 173, 237, 0.15);
    }
`;

const NotificationIcon = styled.div`
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.div`
    color: #e0e6ed;
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
`;

const NotificationMessage = styled.div`
    color: #94a3b8;
    font-size: 0.85rem;
    line-height: 1.4;
    margin-bottom: 0.5rem;
`;

const NotificationTime = styled.div`
    color: #64748b;
    font-size: 0.75rem;
`;

const EmptyState = styled.div`
    padding: 3rem 2rem;
    text-align: center;
    color: #94a3b8;
`;

const EmptyIcon = styled.div`
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
`;

const ViewAllButton = styled.button`
    width: 100%;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: none;
    border-top: 1px solid rgba(0, 173, 237, 0.2);
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
    }
`;

const NotificationBell = () => {
    const { api } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/notifications?limit=20');
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchUnreadCount();
        
        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            
            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                )
            );
            
            // Update unread count
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/mark-all-read');
            
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
            
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Clear all read notifications
    const clearAll = async () => {
        try {
            await api.post('/notifications/clear-all');
            
            setNotifications(prev => prev.filter(n => !n.read));
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    // Format time ago
    const timeAgo = (date) => {
        const now = Date.now();
        const diff = now - new Date(date).getTime();
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return new Date(date).toLocaleDateString();
    };

    // Get icon for notification type
    const getIcon = (type) => {
        switch (type) {
            case 'alert_triggered':
                return '🔔';
            case 'prediction_expiry':
                return '⏰';
            case 'prediction_result':
                return '🎯';
            case 'achievement_unlocked':
                return '🏆';
            case 'level_up':
                return '⬆️';
            case 'portfolio_milestone':
                return '💼';
            default:
                return '📢';
        }
    };

    return (
        <BellContainer ref={dropdownRef}>
            <BellButton 
                onClick={() => setIsOpen(!isOpen)}
                $hasUnread={unreadCount > 0}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>
                )}
            </BellButton>

            {isOpen && (
                <Dropdown>
                    <Header>
                        <Title>Notifications</Title>
                        <Actions>
                            {unreadCount > 0 && (
                                <ActionButton onClick={markAllAsRead}>
                                    <Check size={14} />
                                    Mark all read
                                </ActionButton>
                            )}
                            <ActionButton onClick={clearAll}>
                                <Trash2 size={14} />
                            </ActionButton>
                        </Actions>
                    </Header>

                    <NotificationList>
                        {loading ? (
                            <EmptyState>Loading...</EmptyState>
                        ) : notifications.length === 0 ? (
                            <EmptyState>
                                <EmptyIcon>🔕</EmptyIcon>
                                <div>No notifications yet</div>
                            </EmptyState>
                        ) : (
                            notifications.map(notification => (
                                <NotificationItem
                                    key={notification._id}
                                    $unread={!notification.read}
                                    $type={notification.type}
                                    onClick={() => {
                                        if (!notification.read) {
                                            markAsRead(notification._id);
                                        }
                                    }}
                                >
                                    <NotificationIcon>
                                        {notification.icon || getIcon(notification.type)}
                                    </NotificationIcon>
                                    <NotificationTitle>{notification.title}</NotificationTitle>
                                    <NotificationMessage>{notification.message}</NotificationMessage>
                                    <NotificationTime>{timeAgo(notification.createdAt)}</NotificationTime>
                                </NotificationItem>
                            ))
                        )}
                    </NotificationList>

                    {notifications.length > 0 && (
                        <ViewAllButton onClick={() => {
                            setIsOpen(false);
                            window.location.href = '/notifications';
                        }}>
                            View All Notifications
                        </ViewAllButton>
                    )}
                </Dropdown>
            )}
        </BellContainer>
    );
};

export default NotificationBell;