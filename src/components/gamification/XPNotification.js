// client/src/components/gamification/XPNotification.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Star, Zap } from 'lucide-react';

const slideIn = keyframes`
    from {
        transform: translateX(400px);
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
        transform: translateX(400px);
        opacity: 0;
    }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
`;

const Container = styled.div`
    position: fixed;
    top: 180px;
    right: 2rem;
    z-index: 9999;
    animation: ${props => props.$closing ? slideOut : slideIn} 0.4s ease-out forwards;

    @media (max-width: 768px) {
        right: 1rem;
        left: 1rem;
    }
`;

const Card = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 10px 40px rgba(139, 92, 246, 0.5);
    min-width: 250px;
`;

const IconContainer = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${pulse} 1s ease-in-out infinite;
`;

const Content = styled.div`
    flex: 1;
`;

const Title = styled.div`
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
`;

const Amount = styled.div`
    color: #fbbf24;
    font-weight: 900;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

// Global notification manager
let notificationQueue = [];
let isShowingNotification = false;

const showXPNotification = (amount, reason) => {
    notificationQueue.push({ amount, reason });
    processQueue();
};

const processQueue = () => {
    if (isShowingNotification || notificationQueue.length === 0) return;
    
    isShowingNotification = true;
    const notification = notificationQueue.shift();
    
    // Trigger React component to show
    window.dispatchEvent(new CustomEvent('show-xp-notification', { detail: notification }));
    
    // Process next after 3 seconds
    setTimeout(() => {
        isShowingNotification = false;
        processQueue();
    }, 3000);
};

const XPNotification = () => {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        const handleShow = (event) => {
            setData(event.detail);
            setVisible(true);
            setClosing(false);
            
            // Auto-hide after 2.5 seconds
            setTimeout(() => {
                setClosing(true);
                setTimeout(() => {
                    setVisible(false);
                    setData(null);
                }, 400);
            }, 2500);
        };

        window.addEventListener('show-xp-notification', handleShow);
        return () => window.removeEventListener('show-xp-notification', handleShow);
    }, []);

    if (!visible || !data) return null;

    return (
        <Container $closing={closing}>
            <Card>
                <IconContainer>
                    <Star size={20} color="white" />
                </IconContainer>
                <Content>
                    <Title>{data.reason || 'XP Earned'}</Title>
                    <Amount>
                        <Zap size={18} />
                        +{data.amount} XP
                    </Amount>
                </Content>
            </Card>
        </Container>
    );
};

export { XPNotification, showXPNotification };
export default XPNotification;