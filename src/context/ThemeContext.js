// client/src/context/ThemeContext.js - DEBUG VERSION with extensive logging
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGamification } from './GamificationContext';
import { VAULT_THEMES, getThemeById } from '../data/vaultThemes';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Default theme colors with complete structure
const defaultThemeColors = {
    primary: '#00adef',
    secondary: '#8b5cf6',
    accent: '#8b5cf6',
    background: '#0a0e27',
    cardBackground: 'rgba(10, 14, 39, 0.95)',
    bg: {
        primary: '#0a0e27',
        secondary: 'rgba(10, 14, 39, 0.95)',
        card: 'rgba(30, 41, 59, 0.9)',
        hover: 'rgba(0, 173, 237, 0.1)'
    },
    text: {
        primary: '#f8fafc',
        secondary: '#94a3b8',
        muted: '#64748b'
    },
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#1e293b'
};

export const ThemeProvider = ({ children }) => {
    console.log('🎨 ThemeProvider: Initializing...');
    
    // Initialize with a complete default theme object
    const [currentTheme, setCurrentTheme] = useState({
        colors: defaultThemeColors,
        name: 'Default Theme',
        id: 'theme-default'
    });

    const { gamification, loading: gamificationLoading } = useGamification();
    
    // DEBUG: Log gamification data whenever it changes
    useEffect(() => {
        console.log('🎨 ThemeProvider: Gamification data changed:', {
            loading: gamificationLoading,
            hasGamification: !!gamification,
            gamification: gamification
        });
        
        if (gamification) {
            console.log('🎨 ThemeProvider: Equipped items:', gamification.equippedItems);
            console.log('🎨 ThemeProvider: Profile theme:', gamification.equippedItems?.profileTheme);
        }
    }, [gamification, gamificationLoading]);

    // Update theme when equipped theme changes
    useEffect(() => {
        console.log('🎨 ThemeProvider: useEffect triggered');
        console.log('🎨 ThemeProvider: Loading?', gamificationLoading);
        console.log('🎨 ThemeProvider: Gamification?', !!gamification);
        console.log('🎨 ThemeProvider: Full gamification object:', gamification);
        
        // Wait for gamification data to load
        if (gamificationLoading) {
            console.log('🎨 Waiting for gamification data to load...');
            return;
        }

        // Check if user has an equipped theme
        if (gamification?.equippedItems?.profileTheme) {
            const equippedThemeId = gamification.equippedItems.profileTheme;
            console.log('🎨 User has equipped theme:', equippedThemeId);
            
            const themeData = getThemeById(equippedThemeId);
            console.log('🎨 Theme data from vault:', themeData);
            
            if (themeData && themeData.colors) {
                console.log('✅ Applying equipped theme:', themeData.name);
                console.log('🎨 Theme colors:', themeData.colors);
                
                // Deep merge with default colors to ensure all properties exist
                const mergedTheme = {
                    colors: {
                        ...defaultThemeColors,
                        ...themeData.colors,
                        bg: {
                            ...defaultThemeColors.bg,
                            ...(themeData.colors.bg || {})
                        },
                        text: {
                            ...defaultThemeColors.text,
                            ...(themeData.colors.text || {})
                        }
                    },
                    name: themeData.name,
                    id: equippedThemeId
                };
                
                console.log('🎨 Final merged theme:', mergedTheme);
                setCurrentTheme(mergedTheme);
            } else {
                console.log('⚠️ Theme not found or invalid, using default:', equippedThemeId);
                setCurrentTheme({
                    colors: defaultThemeColors,
                    name: 'Default Theme',
                    id: 'theme-default'
                });
            }
        } else {
            // No theme equipped or user not logged in, use default
            console.log('🎨 No equipped theme found');
            console.log('🎨 Gamification:', gamification);
            console.log('🎨 Equipped items:', gamification?.equippedItems);
            console.log('🎨 Using default theme');
            setCurrentTheme({
                colors: defaultThemeColors,
                name: 'Default Theme',
                id: 'theme-default'
            });
        }
    }, [gamification, gamificationLoading]);

    // Create the value object that will be passed to consumers
    const value = {
        // For useTheme() hook
        theme: currentTheme,
        setTheme: setCurrentTheme,
        colors: currentTheme.colors,
        themeName: currentTheme.name,
        themeId: currentTheme.id
    };

    console.log('🎨 ThemeProvider: Rendering with theme:', currentTheme.name);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;