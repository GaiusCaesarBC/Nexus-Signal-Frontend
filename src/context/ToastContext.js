// client/src/context/ToastContext.js - Toast Notification System

import React, { createContext, useContext, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ============ ANIMATIONS ============
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

const progressBar = keyframes`
    from { width: 100%; }
    to { width: 0%; }
`;

// ============ STYLED COMPONENTS ============
const ToastContainer = styled.div`
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    pointer-events: none;

    @media (max-width: 768px) {
        top: 10px;
        right: 10px;
        left: 10px;
    }
`;

const Toast = styled.div`
    min-width: 300px;
    max-width: 400px;
    background: ${props => getToastBackground(props.type)};
    backdrop-filter: blur(20px);
    border-radius: 12px;
    border: 1px solid ${props => getToastBorder(props.type)};
    padding: 1rem 1.25rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    animation: ${props => props.isExiting ? slideOut : slideIn} 0.3s ease-out forwards;
    pointer-events: all;
    position: relative;
    overflow: hidden;

    @media (max-width: 768px) {
        min-width: auto;
        max-width: 100%;
    }
`;

const IconWrapper = styled.div`
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => getToastIconColor(props.type)};
    filter: drop-shadow(0 0 8px ${props => getToastIconGlow(props.type)});
`;

const Content = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const Title = styled.div`
    font-weight: 600;
    font-size: 0.95rem;
    color: #e0e6ed;
`;

const Message = styled.div`
    font-size: 0.875rem;
    color: #94a3b8;
    line-height: 1.4;
`;

const CloseButton = styled.button`
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 6px;
    color: #cbd5e1;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #e0e6ed;
    }
`;

const ProgressBar = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: ${props => getToastIconColor(props.type)};
    animation: ${progressBar} ${props => props.duration}ms linear;
    border-radius: 0 0 12px 12px;
`;

// ============ HELPER FUNCTIONS ============
const getToastBackground = (type) => {
    switch (type) {
        case 'success':
            return 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)';
        case 'error':
            return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)';
        case 'warning':
            return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)';
        case 'info':
            return 'linear-gradient(135deg, rgba(0, 173, 239, 0.15) 0%, rgba(0, 136, 204, 0.15) 100%)';
        default:
            return 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)';
    }
};

const getToastBorder = (type) => {
    switch (type) {
        case 'success':
            return 'rgba(16, 185, 129, 0.4)';
        case 'error':
            return 'rgba(239, 68, 68, 0.4)';
        case 'warning':
            return 'rgba(245, 158, 11, 0.4)';
        case 'info':
            return 'rgba(0, 173, 239, 0.4)';
        default:
            return 'rgba(100, 116, 139, 0.4)';
    }
};

const getToastIconColor = (type) => {
    switch (type) {
        case 'success':
            return '#10b981';
        case 'error':
            return '#ef4444';
        case 'warning':
            return '#f59e0b';
        case 'info':
            return '#00adef';
        default:
            return '#64748b';
    }
};

const getToastIconGlow = (type) => {
    switch (type) {
        case 'success':
            return 'rgba(16, 185, 129, 0.5)';
        case 'error':
            return 'rgba(239, 68, 68, 0.5)';
        case 'warning':
            return 'rgba(245, 158, 11, 0.5)';
        case 'info':
            return 'rgba(0, 173, 239, 0.5)';
        default:
            return 'rgba(100, 116, 139, 0.5)';
    }
};

const getIcon = (type) => {
    switch (type) {
        case 'success':
            return <CheckCircle size={24} />;
        case 'error':
            return <XCircle size={24} />;
        case 'warning':
            return <AlertTriangle size={24} />;
        case 'info':
            return <Info size={24} />;
        default:
            return <Info size={24} />;
    }
};

// ============ TOAST ITEM COMPONENT ============
const ToastItem = ({ toast, onClose }) => {
    const [isExiting, setIsExiting] = React.useState(false);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(toast.id), 300);
    };

    React.useEffect(() => {
        const timer = setTimeout(handleClose, toast.duration);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Toast type={toast.type} isExiting={isExiting}>
            <IconWrapper type={toast.type}>
                {getIcon(toast.type)}
            </IconWrapper>
            <Content>
                {toast.title && <Title>{toast.title}</Title>}
                {toast.message && <Message>{toast.message}</Message>}
            </Content>
            <CloseButton onClick={handleClose}>
                <X size={16} />
            </CloseButton>
            <ProgressBar type={toast.type} duration={toast.duration} />
        </Toast>
    );
};

// ============ CONTEXT ============
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message, title = null, duration = 5000) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            type,
            message,
            title,
            duration,
        };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after duration
        setTimeout(() => {
            removeToast(id);
        }, duration + 300); // Add 300ms for exit animation
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (message, title = 'Success', duration = 5000) => {
            addToast('success', message, title, duration);
        },
        error: (message, title = 'Error', duration = 6000) => {
            addToast('error', message, title, duration);
        },
        warning: (message, title = 'Warning', duration = 5000) => {
            addToast('warning', message, title, duration);
        },
        info: (message, title = 'Info', duration = 5000) => {
            addToast('info', message, title, duration);
        },
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer>
                {toasts.map(toastItem => (
                    <ToastItem
                        key={toastItem.id}
                        toast={toastItem}
                        onClose={removeToast}
                    />
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};