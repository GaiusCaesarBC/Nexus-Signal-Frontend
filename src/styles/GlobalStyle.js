// client/src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --navbar-height: 60px;
    --mobile-navbar-height: 54px;
    --safe-area-bottom: env(safe-area-inset-bottom, 0px);
    --safe-area-top: env(safe-area-inset-top, 0px);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    /* Prevent iOS bounce scroll */
    overscroll-behavior: none;
    /* Smooth scrolling */
    scroll-behavior: smooth;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #0a0f1c;
    color: #e0e6ed;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Prevent text size adjustment on orientation change */
    -webkit-text-size-adjust: 100%;
    /* Prevent pull-to-refresh on mobile */
    overscroll-behavior-y: contain;
  }

  a {
    color: #00adef;
    text-decoration: none;
    /* Touch-friendly link styling */
    -webkit-tap-highlight-color: rgba(0, 173, 239, 0.2);

    &:hover {
      text-decoration: underline;
    }
  }

  ul {
    list-style: none;
  }

  h1, h2, h3, h4, h5, h6 {
    color: #e0e6ed;
    margin-bottom: 0.5rem;
  }

  /* ========================================
     TOUCH-FRIENDLY BUTTONS (44x44px minimum)
     ======================================== */
  button,
  [role="button"],
  .btn,
  input[type="button"],
  input[type="submit"] {
    font-family: inherit;
    min-height: 44px;
    min-width: 44px;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;

    /* Touch feedback */
    &:active:not(:disabled) {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }

  /* ========================================
     FORM ELEMENTS
     ======================================== */
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  input[type="search"],
  input[type="tel"],
  input[type="url"],
  select,
  textarea {
    background-color: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.3);
    color: #e0e6ed;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    width: 100%;
    font-size: 16px; /* Prevent iOS zoom on focus */
    min-height: 44px;
    touch-action: manipulation;

    &:focus {
      outline: none;
      border-color: #00adef;
      box-shadow: 0 0 0 3px rgba(0, 173, 239, 0.2);
    }

    &::placeholder {
      color: #64748b;
    }
  }

  /* ========================================
     MOBILE MODAL FULL-SCREEN
     ======================================== */
  @media (max-width: 768px) {
    /* Generic modal containers */
    [data-modal="true"],
    .modal-container,
    .modal-content {
      width: 100vw !important;
      max-width: 100vw !important;
      min-height: 100vh !important;
      height: 100vh !important;
      margin: 0 !important;
      border-radius: 0 !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch;
    }

    /* Modal overlays */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1000;
    }
  }

  /* ========================================
     MOBILE TABLE SCROLL
     ======================================== */
  @media (max-width: 768px) {
    .table-responsive,
    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      position: relative;

      /* Scroll hint */
      &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 20px;
        background: linear-gradient(to right, transparent, rgba(10, 15, 28, 0.9));
        pointer-events: none;
      }
    }
  }

  /* ========================================
     MOBILE TYPOGRAPHY SCALING
     ======================================== */
  @media (max-width: 480px) {
    html {
      font-size: 14px;
    }

    h1 { font-size: 1.75rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    h4 { font-size: 1.1rem; }
  }

  @media (max-width: 375px) {
    html {
      font-size: 13px;
    }

    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.35rem; }
    h3 { font-size: 1.15rem; }
  }

  /* ========================================
     MOBILE PADDING ADJUSTMENTS
     ======================================== */
  @media (max-width: 480px) {
    .page-container,
    .content-container {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
  }

  @media (max-width: 375px) {
    .page-container,
    .content-container {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }

  /* ========================================
     SAFE AREA HANDLING (notched devices)
     ======================================== */
  @supports (padding: max(0px)) {
    body {
      padding-left: max(0px, env(safe-area-inset-left));
      padding-right: max(0px, env(safe-area-inset-right));
    }
  }

  /* ========================================
     FOCUS VISIBLE (accessibility)
     ======================================== */
  :focus-visible {
    outline: 2px solid #00adef;
    outline-offset: 2px;
  }

  /* Remove focus ring for mouse users */
  :focus:not(:focus-visible) {
    outline: none;
  }

  /* ========================================
     REDUCED MOTION (accessibility)
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* ========================================
     SCROLLBAR STYLING
     ======================================== */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.5);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.7);
  }

  /* Hide scrollbar on mobile for cleaner look */
  @media (max-width: 768px) {
    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
  }
`;

export default GlobalStyle;
