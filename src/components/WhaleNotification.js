// src/components/WhaleNotification.js - Real-time Whale Alert Notifications
// Shows toast notifications when significant whale activity is detected

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    Waves, Users, BarChart3, Landmark, X,
    TrendingUp, TrendingDown, AlertTriangle, Bell
} from 'lucide-react';
import TickerLink from './TickerLink';

// ============ ANIMATIONS ============
const slideIn = keyframes`
    from {
        transform: translateX(120%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(120%);
        opacity: 0;
    }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(247, 147, 26, 0.3); }
    50% { box-shadow: 0 0 40px rgba(247, 147, 26, 0.6); }
`;

// ============ STYLED COMPONENTS ============
const NotificationContainer = styled.div`
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 380px;
    pointer-events: none;

    @media (max-width: 480px) {
        right: 10px;
        left: 10px;
        max-width: none;
    }
`;

const Notification = styled.div`
    background: linear-gradient(135deg, rgba(20, 25, 45, 0.98) 0%, rgba(30, 35, 55, 0.98) 100%);
    border: 1px solid ${props => {
        if (props.$significance === 'massive') return 'rgba(245, 158, 11, 0.6)';
        if (props.$bullish) return 'rgba(16, 185, 129, 0.4)';
        if (props.$bearish) return 'rgba(239, 68, 68, 0.4)';
        return 'rgba(247, 147, 26, 0.4)';
    }};
    border-radius: 12px;
    padding: 1rem;
    animation: ${props => props.$exiting ? slideOut : slideIn} 0.3s ease-out forwards;
    cursor: pointer;
    pointer-events: auto;
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;

    ${props => props.$significance === 'massive' && `
        animation: ${slideIn} 0.3s ease-out, ${glow} 2s ease-in-out infinite;
    `}

    &:hover {
        transform: scale(1.02);
        border-color: rgba(247, 147, 26, 0.6);
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: ${props => {
            if (props.$bullish) return '#10b981';
            if (props.$bearish) return '#ef4444';
            return '#f7931a';
        }};
    }
`;

const NotificationHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
`;

const NotificationTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 0.9rem;
    color: ${props => props.$color || '#f7931a'};
`;

const CloseButton = styled.button`
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #94a3b8;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
    }
`;

const NotificationBody = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const NotificationIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: ${props => props.$bg || 'rgba(247, 147, 26, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || '#f7931a'};
    flex-shrink: 0;
`;

const NotificationContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const SymbolRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
`;

const Symbol = styled.span`
    font-weight: 800;
    font-size: 1.1rem;
    color: #e0e6ed;
`;

const Badge = styled.span`
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    background: ${props => props.$bullish ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
    color: ${props => props.$bullish ? '#10b981' : '#ef4444'};
`;

const Description = styled.div`
    font-size: 0.85rem;
    color: #94a3b8;
`;

const Value = styled.div`
    font-weight: 700;
    font-size: 1rem;
    color: ${props => props.$color || '#e0e6ed'};
    text-align: right;
`;

const ProgressBar = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: ${props => props.$color || '#f7931a'};
    width: ${props => props.$progress}%;
    transition: width 0.1s linear;
`;

// ============ HELPER FUNCTIONS ============
const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
};

const getNotificationData = (alert) => {
    switch (alert.alertType) {
        case 'insider':
            return {
                icon: <Users size={20} />,
                iconBg: 'rgba(59, 130, 246, 0.2)',
                iconColor: '#3b82f6',
                titleColor: '#3b82f6',
                title: 'Insider Trade',
                bullish: alert.transactionType === 'BUY',
                bearish: alert.transactionType === 'SELL',
                description: `${alert.insiderTitle || 'Insider'} ${alert.transactionType?.toLowerCase()}s ${formatCurrency(alert.totalValue)}`,
                value: alert.totalValue
            };
        case 'crypto':
            return {
                icon: <Waves size={20} />,
                iconBg: 'rgba(247, 147, 26, 0.2)',
                iconColor: '#f7931a',
                titleColor: '#f7931a',
                title: 'Whale Alert 🐋',
                bullish: alert.type === 'exchange_outflow',
                bearish: alert.type === 'exchange_inflow',
                description: alert.type === 'exchange_outflow' 
                    ? `${formatCurrency(alert.amountUsd)} leaving exchange` 
                    : `${formatCurrency(alert.amountUsd)} entering exchange`,
                value: alert.amountUsd
            };
        case 'options':
            return {
                icon: <BarChart3 size={20} />,
                iconBg: 'rgba(139, 92, 246, 0.2)',
                iconColor: '#a78bfa',
                titleColor: '#a78bfa',
                title: 'Unusual Options',
                bullish: alert.sentiment === 'BULLISH',
                bearish: alert.sentiment === 'BEARISH',
                description: `${alert.optionType} ${alert.orderType} - ${alert.sentiment}`,
                value: alert.premium
            };
        case 'congress':
            return {
                icon: <Landmark size={20} />,
                iconBg: 'rgba(16, 185, 129, 0.2)',
                iconColor: '#10b981',
                titleColor: '#10b981',
                title: 'Congress Trade',
                bullish: alert.transactionType === 'BUY',
                bearish: alert.transactionType === 'SELL',
                description: `${alert.politicianName} ${alert.transactionType?.toLowerCase()}s`,
                value: 0
            };
        default:
            return {
                icon: <AlertTriangle size={20} />,
                iconBg: 'rgba(247, 147, 26, 0.2)',
                iconColor: '#f7931a',
                titleColor: '#f7931a',
                title: 'Market Alert',
                bullish: false,
                bearish: false,
                description: 'New activity detected',
                value: 0
            };
    }
};

// ============ COMPONENT ============
const WhaleNotification = () => {
    const navigate = useNavigate();
    const { api, isAuthenticated } = useAuth();
    
    const [notifications, setNotifications] = useState([]);
    const [seenAlertIds, setSeenAlertIds] = useState(new Set());
    
    // Use refs to avoid dependency issues
    const apiRef = React.useRef(api);
    const seenAlertIdsRef = React.useRef(seenAlertIds);
    const hasInitialized = React.useRef(false);
    
    // Keep refs in sync
    useEffect(() => {
        apiRef.current = api;
    }, [api]);
    
    useEffect(() => {
        seenAlertIdsRef.current = seenAlertIds;
    }, [seenAlertIds]);

    // Remove notification after timeout
    const removeNotification = useCallback((id) => {
        setNotifications(prev => 
            prev.map(n => n.notifId === id ? { ...n, exiting: true } : n)
        );
        
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.notifId !== id));
        }, 300);
    }, []);

    // Add new notification
    const addNotification = useCallback((alert) => {
        const id = `notif-${alert.id}-${Date.now()}`;
        
        setNotifications(prev => {
            const newNotifications = [...prev];
            if (newNotifications.length >= 3) {
                newNotifications.shift();
            }
            return [...newNotifications, { ...alert, notifId: id, progress: 100, exiting: false }];
        });

        const duration = 8000;
        const interval = 100;
        let progress = 100;
        
        const progressInterval = setInterval(() => {
            progress -= (interval / duration) * 100;
            setNotifications(prev => 
                prev.map(n => n.notifId === id ? { ...n, progress } : n)
            );
            
            if (progress <= 0) {
                clearInterval(progressInterval);
                setNotifications(prev => 
                    prev.map(n => n.notifId === id ? { ...n, exiting: true } : n)
                );
                setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.notifId !== id));
                }, 300);
            }
        }, interval);

        return () => clearInterval(progressInterval);
    }, []);

    // Initial fetch and polling - runs once on mount
    useEffect(() => {
        if (!isAuthenticated) return;

        let isMounted = true;

        // Initial fetch - mark existing alerts as seen (no notifications)
        const initialFetch = async () => {
            try {
                const response = await apiRef.current.get('/whale/alerts', { params: { limit: 20 } });
                if (response.data.success && response.data.alerts && isMounted) {
                    const ids = new Set(response.data.alerts.map(a => a.id));
                    setSeenAlertIds(ids);
                    hasInitialized.current = true;
                }
            } catch (error) {
                console.error('Error initial fetch:', error);
            }
        };

        // Check for new alerts (called periodically)
        const checkForNewAlerts = async () => {
            if (!hasInitialized.current || !isMounted) return;

            try {
                const response = await apiRef.current.get('/whale/alerts', { params: { limit: 10 } });
                
                if (response.data.success && response.data.alerts && isMounted) {
                    const alerts = response.data.alerts;
                    const currentSeen = seenAlertIdsRef.current;
                    
                    alerts.forEach(alert => {
                        const alertId = alert.id;
                        
                        if (currentSeen.has(alertId)) return;
                        
                        const isSignificant = alert.significance === 'massive' || alert.significance === 'high';
                        const alertTime = new Date(alert.timestamp || alert.filingDate);
                        const isRecent = alertTime > new Date(Date.now() - 30 * 60 * 1000);
                        
                        if (isSignificant && isRecent) {
                            addNotification(alert);
                        }
                        
                        setSeenAlertIds(prev => new Set([...prev, alertId]));
                    });
                }
            } catch (error) {
                console.error('Error checking for whale alerts:', error);
            }
        };

        initialFetch();

        // Poll every 2 minutes
        const pollInterval = setInterval(checkForNewAlerts, 2 * 60 * 1000);
        
        return () => {
            isMounted = false;
            clearInterval(pollInterval);
        };
    }, [isAuthenticated, addNotification]); // Only depends on isAuthenticated and addNotification

    // ... rest of component stays the same

    
    // Handle click on notification
    const handleNotificationClick = (alert) => {
        // Navigate to the appropriate page based on alert type
        if (alert.alertType === 'crypto') {
            navigate(`/crypto/${alert.symbol}`);
        } else if (alert.symbol) {
            navigate(`/stocks/${alert.symbol}`);
        } else {
            navigate('/whale-alerts');
        }
        removeNotification(alert.notifId);
    };

    if (notifications.length === 0) return null;

    return (
        <NotificationContainer>
            {notifications.map(alert => {
                const data = getNotificationData(alert);
                
                return (
                    <Notification
                        key={alert.notifId}
                        $bullish={data.bullish}
                        $bearish={data.bearish}
                        $significance={alert.significance}
                        $exiting={alert.exiting}
                        onClick={() => handleNotificationClick(alert)}
                    >
                        <NotificationHeader>
                            <NotificationTitle $color={data.titleColor}>
                                {data.icon}
                                {data.title}
                                {alert.significance === 'massive' && ' 🔥'}
                            </NotificationTitle>
                            <CloseButton 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(alert.notifId);
                                }}
                            >
                                <X size={14} />
                            </CloseButton>
                        </NotificationHeader>
                        
                        <NotificationBody>
                            <NotificationIcon $bg={data.iconBg} $color={data.iconColor}>
                                {data.bullish ? <TrendingUp size={20} /> : 
                                 data.bearish ? <TrendingDown size={20} /> : data.icon}
                            </NotificationIcon>
                            
                            <NotificationContent>
                                <SymbolRow>
                                    <Symbol>{alert.symbol}</Symbol>
                                    <Badge $bullish={data.bullish}>
                                        {data.bullish ? '↑ BULLISH' : data.bearish ? '↓ BEARISH' : 'NEUTRAL'}
                                    </Badge>
                                </SymbolRow>
                                <Description>{data.description}</Description>
                            </NotificationContent>
                            
                            {data.value > 0 && (
                                <Value $color={data.bullish ? '#10b981' : data.bearish ? '#ef4444' : '#e0e6ed'}>
                                    {formatCurrency(data.value)}
                                </Value>
                            )}
                        </NotificationBody>
                        
                        <ProgressBar 
                            $progress={alert.progress} 
                            $color={data.bullish ? '#10b981' : data.bearish ? '#ef4444' : '#f7931a'}
                        />
                    </Notification>
                );
            })}
        </NotificationContainer>
    );
};

export default WhaleNotification;