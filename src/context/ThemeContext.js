// client/src/context/ThemeContext.js - THEME MANAGEMENT

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Theme configuration
const themes = {
    dark: {
        name: 'dark',
        colors: {
            bg: {
                primary: 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)',
                secondary: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                tertiary: 'rgba(15, 23, 42, 0.6)',
                overlay: 'rgba(0, 0, 0, 0.8)'
            },
            text: {
                primary: '#e0e6ed',
                secondary: '#94a3b8',
                tertiary: '#64748b',
                accent: '#00adef'
            },
            brand: {
                primary: '#00adef',
                secondary: '#00ff88',
                gradient: 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'
            },
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
            border: {
                primary: 'rgba(0, 173, 237, 0.3)',
                secondary: 'rgba(0, 173, 237, 0.2)',
                tertiary: 'rgba(100, 116, 139, 0.3)'
            }
        }
    },
    light: {
        name: 'light',
        colors: {
            bg: {
                primary: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
                secondary: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                tertiary: 'rgba(248, 250, 252, 0.9)',
                overlay: 'rgba(0, 0, 0, 0.5)'
            },
            text: {
                primary: '#0f172a',
                secondary: '#475569',
                tertiary: '#94a3b8',
                accent: '#0284c7'
            },
            brand: {
                primary: '#0284c7',
                secondary: '#10b981',
                gradient: 'linear-gradient(135deg, #0284c7 0%, #10b981 100%)'
            },
            success: '#059669',
            warning: '#d97706',
            error: '#dc2626',
            info: '#2563eb',
            border: {
                primary: 'rgba(2, 132, 199, 0.4)',
                secondary: 'rgba(2, 132, 199, 0.2)',
                tertiary: 'rgba(148, 163, 184, 0.3)'
            }
        }
    }
};

export const ThemeProvider = ({ children }) => {
    // Get initial theme from localStorage or default to dark
    const [currentTheme, setCurrentTheme] = useState(() => {
        const savedTheme = localStorage.getItem('nexus-theme');
        return savedTheme || 'dark';
    });

    // Get theme object
    const theme = themes[currentTheme];

    // Toggle between dark and light
    const toggleTheme = () => {
        setCurrentTheme(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('nexus-theme', newTheme);
            return newTheme;
        });
    };

    // Set specific theme
    const setTheme = (themeName) => {
        if (themes[themeName]) {
            setCurrentTheme(themeName);
            localStorage.setItem('nexus-theme', themeName);
        }
    };

    // Update document theme attribute for CSS
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }, [currentTheme]);

    const value = {
        theme,
        currentTheme,
        toggleTheme,
        setTheme,
        isDark: currentTheme === 'dark',
        isLight: currentTheme === 'light'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;