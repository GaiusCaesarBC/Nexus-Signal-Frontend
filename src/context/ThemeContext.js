// client/src/context/ThemeContext.js - Simple Dark Theme System

import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// ============ THEME DEFINITION ============

export const darkTheme = {
    name: 'dark',
    colors: {
        // Backgrounds
        bg: {
            primary: 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
            secondary: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            tertiary: 'rgba(15, 23, 42, 0.8)',
            card: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
            hover: 'rgba(0, 173, 237, 0.1)',
            particle: '#00adef',
        },
        // Text
        text: {
            primary: '#e0e6ed',
            secondary: '#94a3b8',
            tertiary: '#64748b',
        },
        // Accent colors
        accent: {
            primary: '#00adef',
            secondary: '#0088cc',
            gradient: 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)',
            glow: 'rgba(0, 173, 237, 0.3)',
        },
        // Status colors
        success: {
            primary: '#10b981',
            secondary: '#059669',
            bg: 'rgba(16, 185, 129, 0.15)',
            border: 'rgba(16, 185, 129, 0.3)',
        },
        danger: {
            primary: '#ef4444',
            secondary: '#dc2626',
            bg: 'rgba(239, 68, 68, 0.15)',
            border: 'rgba(239, 68, 68, 0.3)',
        },
        warning: {
            primary: '#f59e0b',
            secondary: '#d97706',
            bg: 'rgba(245, 158, 11, 0.15)',
            border: 'rgba(245, 158, 11, 0.3)',
        },
        info: {
            primary: '#3b82f6',
            secondary: '#2563eb',
            bg: 'rgba(59, 130, 246, 0.15)',
            border: 'rgba(59, 130, 246, 0.3)',
        },
        // Borders
        border: {
            primary: 'rgba(0, 173, 237, 0.2)',
            secondary: 'rgba(0, 173, 237, 0.3)',
            hover: 'rgba(0, 173, 237, 0.5)',
        },
        // Shadows
        shadow: {
            small: '0 4px 20px rgba(0, 0, 0, 0.3)',
            medium: '0 8px 32px rgba(0, 0, 0, 0.5)',
            large: '0 10px 40px rgba(0, 173, 237, 0.3)',
            glow: '0 0 20px rgba(0, 173, 237, 0.3)',
        }
    }
};

// ============ THEME PROVIDER ============

export const ThemeProvider = ({ children }) => {
    const theme = darkTheme;

    const value = {
        theme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;