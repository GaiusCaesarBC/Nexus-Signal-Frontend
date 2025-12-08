// Responsive breakpoints and mixins
import { css } from 'styled-components';

export const breakpoints = {
    xs: '375px',      // iPhone SE, small Android
    mobile: '480px',  // Large phones
    tablet: '768px',  // Tablets
    laptop: '1024px', // Small laptops
    desktop: '1440px' // Large desktops
};

// Media query helpers (max-width - mobile-first approach)
export const xs = (styles) => css`
    @media (max-width: ${breakpoints.xs}) {
        ${styles}
    }
`;

export const mobile = (styles) => css`
    @media (max-width: ${breakpoints.mobile}) {
        ${styles}
    }
`;

export const tablet = (styles) => css`
    @media (max-width: ${breakpoints.tablet}) {
        ${styles}
    }
`;

export const laptop = (styles) => css`
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
    hideOnMobile: tablet(css`
        display: none;
    `),

    // Show only on mobile
    showOnMobile: css`
        display: none;
        ${tablet(css`
            display: block;
        `)}
    `,

    // Stack columns
    stackOnMobile: tablet(css`
        grid-template-columns: 1fr !important;
        flex-direction: column !important;
    `),

    // Full width on mobile
    fullWidthMobile: tablet(css`
        width: 100% !important;
        max-width: 100% !important;
    `),

    // Responsive title with fluid sizing
    responsiveTitle: css`
        font-size: clamp(1.75rem, 5vw, 3.5rem);
    `,

    // Touch-friendly buttons (44x44px minimum per Apple HIG)
    touchButton: css`
        min-height: 44px;
        min-width: 44px;
        padding: 0.75rem 1.5rem;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;

        &:active {
            transform: scale(0.98);
        }
    `,

    // Mobile padding (scales down for smaller screens)
    mobilePadding: css`
        padding: 2rem;

        ${tablet(css`
            padding: 1rem;
        `)}

        ${mobile(css`
            padding: 0.75rem;
        `)}

        ${xs(css`
            padding: 0.5rem;
        `)}
    `,

    // Responsive text sizing
    responsiveText: css`
        font-size: 1rem;

        ${mobile(css`
            font-size: 0.9rem;
        `)}

        ${xs(css`
            font-size: 0.85rem;
        `)}
    `,

    // Safe area padding for notched devices
    safeAreaPadding: css`
        padding-bottom: max(1rem, env(safe-area-inset-bottom));
        padding-left: max(1rem, env(safe-area-inset-left));
        padding-right: max(1rem, env(safe-area-inset-right));
    `
};

// Modal styles for mobile
export const mobileModal = css`
    ${tablet(css`
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100vh !important;
        max-height: 100vh !important;
        margin: 0 !important;
        border-radius: 0 !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
    `)}
`;

// Card-based table alternative for mobile
export const mobileCardTable = css`
    ${tablet(css`
        /* Hide table headers on mobile */
        thead {
            display: none;
        }

        /* Make rows into cards */
        tbody tr {
            display: block;
            margin-bottom: 1rem;
            padding: 1rem;
            background: rgba(30, 41, 59, 0.8);
            border-radius: 12px;
            border: 1px solid rgba(100, 116, 139, 0.2);
        }

        /* Stack table cells */
        tbody td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(100, 116, 139, 0.1);

            &:last-child {
                border-bottom: none;
            }

            /* Use data-label for mobile headers */
            &::before {
                content: attr(data-label);
                font-weight: 600;
                color: #94a3b8;
                font-size: 0.85rem;
            }
        }
    `)}
`;

// Horizontal scroll container for tables
export const mobileScrollTable = css`
    ${tablet(css`
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;

        /* Scroll hint gradient */
        &::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 30px;
            background: linear-gradient(to right, transparent, rgba(10, 15, 28, 0.8));
            pointer-events: none;
        }

        table {
            min-width: 600px;
        }
    `)}
`;

// Global touch target enforcement
export const touchTarget = css`
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;

    &:active {
        opacity: 0.8;
    }
`;

// Responsive gap utility
export const responsiveGap = css`
    gap: 1.5rem;

    ${tablet(css`
        gap: 1rem;
    `)}

    ${mobile(css`
        gap: 0.75rem;
    `)}
`;

// Responsive grid that stacks on mobile
export const responsiveGrid = css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;

    ${mobile(css`
        grid-template-columns: 1fr;
        gap: 1rem;
    `)}
`;
