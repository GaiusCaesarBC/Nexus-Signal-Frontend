// Responsive breakpoints and mixins
import { css } from 'styled-components';

export const breakpoints = {
    mobile: '480px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1440px'
};

export const mobile = (styles) => css`
    @media (max-width: ${breakpoints.tablet}) {
        ${styles}
    }
`;

export const tablet = (styles) => css`
    @media (max-width: ${breakpoints.laptop}) {
        ${styles}
    }
`;

export const desktop = (styles) => css`
    @media (min-width: ${breakpoints.laptop}) {
        ${styles}
    }
`;

// Common mobile styles
export const mobileResponsive = {
    // Hide on mobile
    hideOnMobile: mobile(css`
        display: none;
    `),
    
    // Stack columns
    stackOnMobile: mobile(css`
        grid-template-columns: 1fr !important;
    `),
    
    // Full width on mobile
    fullWidthMobile: mobile(css`
        width: 100% !important;
        max-width: 100% !important;
    `),
    
    // Smaller text on mobile
    responsiveTitle: css`
        font-size: 3.5rem;
        ${mobile(css`
            font-size: 2rem;
        `)}
    `,
    
    // Touch-friendly buttons
    touchButton: css`
        min-height: 44px;
        min-width: 44px;
        padding: 0.75rem 1.5rem;
    `,
    
    // Mobile padding
    mobilePadding: mobile(css`
        padding: 1rem !important;
    `)
};