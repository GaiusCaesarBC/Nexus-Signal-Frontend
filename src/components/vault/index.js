// client/src/components/vault/index.js
// Export all vault visual components

export { default as AvatarWithBorder, BORDER_STYLES } from './AvatarWithBorder';
export { default as BadgeDisplay, SingleBadge, BADGE_DEFINITIONS } from './BadgeDisplay';
export { default as UserCard } from './UserCard';
export { 
    default as ProfileThemes, 
    PROFILE_THEMES, 
    ProfileThemeProvider, 
    useProfileTheme, 
    getTheme, 
    getThemeCSS,
    themeStyles 
} from './ProfileTheme';