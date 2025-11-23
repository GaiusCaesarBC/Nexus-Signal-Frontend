// client/src/data/vaultThemes.js
// Comprehensive theme definitions with all required properties

export const VAULT_THEMES = {
    'theme-default': {
        name: 'Default Theme',
        colors: {
            // Primary colors
            primary: '#00adef',
            secondary: '#8b5cf6',
            accent: '#8b5cf6',
            
            // Background structure (for bg.primary, bg.secondary, etc.)
            background: '#0a0e27',
            cardBackground: 'rgba(10, 14, 39, 0.95)',
            bg: {
                primary: '#0a0e27',
                secondary: 'rgba(10, 14, 39, 0.95)',
                card: 'rgba(30, 41, 59, 0.9)',
                hover: 'rgba(0, 173, 237, 0.1)'
            },
            
            // Text colors
            text: {
                primary: '#f8fafc',
                secondary: '#94a3b8',
                muted: '#64748b'
            },
            textSecondary: '#94a3b8',
            textMuted: '#64748b',
            
            // Border colors
            border: '#1e293b'
        }
    },
    'theme-ocean': {
        name: 'Ocean Depths',
        colors: {
            primary: '#06b6d4',
            secondary: '#0891b2',
            accent: '#0891b2',
            background: '#0a1929',
            cardBackground: 'rgba(10, 25, 41, 0.95)',
            bg: {
                primary: '#0a1929',
                secondary: 'rgba(10, 25, 41, 0.95)',
                card: 'rgba(14, 29, 45, 0.9)',
                hover: 'rgba(6, 182, 212, 0.1)'
            },
            text: {
                primary: '#f0f9ff',
                secondary: '#7dd3fc',
                muted: '#0c4a6e'
            },
            textSecondary: '#7dd3fc',
            textMuted: '#0c4a6e',
            border: '#0c4a6e'
        }
    },
    'theme-forest': {
        name: 'Forest Mist',
        colors: {
            primary: '#10b981',
            secondary: '#059669',
            accent: '#059669',
            background: '#0a1a0f',
            cardBackground: 'rgba(10, 26, 15, 0.95)',
            bg: {
                primary: '#0a1a0f',
                secondary: 'rgba(10, 26, 15, 0.95)',
                card: 'rgba(14, 30, 19, 0.9)',
                hover: 'rgba(16, 185, 129, 0.1)'
            },
            text: {
                primary: '#f0fdf4',
                secondary: '#86efac',
                muted: '#064e3b'
            },
            textSecondary: '#86efac',
            textMuted: '#064e3b',
            border: '#064e3b'
        }
    },
    'theme-crimson': {
        name: 'Crimson Fury',
        colors: {
            primary: '#ef4444',
            secondary: '#dc2626',
            accent: '#dc2626',
            background: '#1a0a0a',
            cardBackground: 'rgba(26, 10, 10, 0.95)',
            bg: {
                primary: '#1a0a0a',
                secondary: 'rgba(26, 10, 10, 0.95)',
                card: 'rgba(30, 14, 14, 0.9)',
                hover: 'rgba(239, 68, 68, 0.1)'
            },
            text: {
                primary: '#fef2f2',
                secondary: '#fca5a5',
                muted: '#7f1d1d'
            },
            textSecondary: '#fca5a5',
            textMuted: '#7f1d1d',
            border: '#7f1d1d'
        }
    },
    'theme-midnight': {
        name: 'Midnight Purple',
        colors: {
            primary: '#8b5cf6',
            secondary: '#7c3aed',
            accent: '#7c3aed',
            background: '#0f0a1a',
            cardBackground: 'rgba(15, 10, 26, 0.95)',
            bg: {
                primary: '#0f0a1a',
                secondary: 'rgba(15, 10, 26, 0.95)',
                card: 'rgba(19, 14, 30, 0.9)',
                hover: 'rgba(139, 92, 246, 0.1)'
            },
            text: {
                primary: '#faf5ff',
                secondary: '#c4b5fd',
                muted: '#4c1d95'
            },
            textSecondary: '#c4b5fd',
            textMuted: '#4c1d95',
            border: '#4c1d95'
        }
    },
    'theme-aurora': {
        name: 'Aurora Borealis',
        colors: {
            primary: '#22d3ee',
            secondary: '#06b6d4',
            accent: '#a78bfa',
            background: '#0a1420',
            cardBackground: 'rgba(10, 20, 32, 0.95)',
            bg: {
                primary: '#0a1420',
                secondary: 'rgba(10, 20, 32, 0.95)',
                card: 'rgba(14, 24, 36, 0.9)',
                hover: 'rgba(34, 211, 238, 0.1)'
            },
            text: {
                primary: '#f0fdfa',
                secondary: '#5eead4',
                muted: '#134e4a'
            },
            textSecondary: '#5eead4',
            textMuted: '#134e4a',
            border: '#134e4a'
        }
    },
    'theme-goldrush': {
        name: 'Gold Rush',
        colors: {
            primary: '#f59e0b',
            secondary: '#d97706',
            accent: '#d97706',
            background: '#1a1410',
            cardBackground: 'rgba(26, 20, 16, 0.95)',
            bg: {
                primary: '#1a1410',
                secondary: 'rgba(26, 20, 16, 0.95)',
                card: 'rgba(30, 24, 20, 0.9)',
                hover: 'rgba(245, 158, 11, 0.1)'
            },
            text: {
                primary: '#fffbeb',
                secondary: '#fcd34d',
                muted: '#78350f'
            },
            textSecondary: '#fcd34d',
            textMuted: '#78350f',
            border: '#78350f'
        }
    },
    'theme-cosmic': {
        name: 'Cosmic Void',
        colors: {
            primary: '#ec4899',
            secondary: '#d946ef',
            accent: '#d946ef',
            background: '#0a0a1a',
            cardBackground: 'rgba(10, 10, 26, 0.95)',
            bg: {
                primary: '#0a0a1a',
                secondary: 'rgba(10, 10, 26, 0.95)',
                card: 'rgba(14, 14, 30, 0.9)',
                hover: 'rgba(236, 72, 153, 0.1)'
            },
            text: {
                primary: '#fdf4ff',
                secondary: '#f0abfc',
                muted: '#701a75'
            },
            textSecondary: '#f0abfc',
            textMuted: '#701a75',
            border: '#701a75'
        }
    },
    'theme-sunset': {
        name: 'Sunset Blaze',
        colors: {
            primary: '#fb923c',
            secondary: '#f97316',
            accent: '#f97316',
            background: '#1a0f0a',
            cardBackground: 'rgba(26, 15, 10, 0.95)',
            bg: {
                primary: '#1a0f0a',
                secondary: 'rgba(26, 15, 10, 0.95)',
                card: 'rgba(30, 19, 14, 0.9)',
                hover: 'rgba(251, 146, 60, 0.1)'
            },
            text: {
                primary: '#fff7ed',
                secondary: '#fdba74',
                muted: '#7c2d12'
            },
            textSecondary: '#fdba74',
            textMuted: '#7c2d12',
            border: '#7c2d12'
        }
    },
    'theme-emerald': {
        name: 'Emerald Dreams',
        colors: {
            primary: '#34d399',
            secondary: '#10b981',
            accent: '#10b981',
            background: '#0a1a14',
            cardBackground: 'rgba(10, 26, 20, 0.95)',
            bg: {
                primary: '#0a1a14',
                secondary: 'rgba(10, 26, 20, 0.95)',
                card: 'rgba(14, 30, 24, 0.9)',
                hover: 'rgba(52, 211, 153, 0.1)'
            },
            text: {
                primary: '#ecfdf5',
                secondary: '#6ee7b7',
                muted: '#065f46'
            },
            textSecondary: '#6ee7b7',
            textMuted: '#065f46',
            border: '#065f46'
        }
    },
    'theme-royal': {
        name: 'Royal Gold',
        colors: {
            primary: '#fbbf24',
            secondary: '#f59e0b',
            accent: '#f59e0b',
            background: '#1a1510',
            cardBackground: 'rgba(26, 21, 16, 0.95)',
            bg: {
                primary: '#1a1510',
                secondary: 'rgba(26, 21, 16, 0.95)',
                card: 'rgba(30, 25, 20, 0.9)',
                hover: 'rgba(251, 191, 36, 0.1)'
            },
            text: {
                primary: '#fef3c7',
                secondary: '#fcd34d',
                muted: '#78350f'
            },
            textSecondary: '#fcd34d',
            textMuted: '#78350f',
            border: '#78350f'
        }
    },
    'theme-neon': {
        name: 'Neon Nights',
        colors: {
            primary: '#22c55e',
            secondary: '#16a34a',
            accent: '#a3e635',
            background: '#0a1a0f',
            cardBackground: 'rgba(10, 26, 15, 0.95)',
            bg: {
                primary: '#0a1a0f',
                secondary: 'rgba(10, 26, 15, 0.95)',
                card: 'rgba(14, 30, 19, 0.9)',
                hover: 'rgba(34, 197, 94, 0.1)'
            },
            text: {
                primary: '#f0fdf4',
                secondary: '#86efac',
                muted: '#14532d'
            },
            textSecondary: '#86efac',
            textMuted: '#14532d',
            border: '#14532d'
        }
    }
};

// Helper function to get theme by ID
export const getThemeById = (themeId) => {
    return VAULT_THEMES[themeId] || VAULT_THEMES['theme-default'];
};

// Helper function to get all theme IDs
export const getAllThemeIds = () => {
    return Object.keys(VAULT_THEMES);
};

// Helper function to check if theme exists
export const themeExists = (themeId) => {
    return VAULT_THEMES.hasOwnProperty(themeId);
};

export default VAULT_THEMES;