// client/src/onboarding/styles.js
//
// Shared themed atoms for the onboarding overlay system. Tiny — only
// what's needed across the 5 onboarding components. Theme values are
// pulled from the styled-components ThemeProvider via the same `t()`
// helper pattern used elsewhere in the app.

import styled, { keyframes, css } from 'styled-components';

// ─── helpers ────────────────────────────────────────────────────

export const t = (props, path, fallback) => {
    const segs = path.split('.');
    let cur = props.theme;
    for (const s of segs) {
        if (cur == null) return fallback;
        cur = cur[s];
    }
    return cur ?? fallback;
};

// ─── animations ─────────────────────────────────────────────────

export const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
`;

export const fadeInQuick = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

export const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 0 rgba(0, 173, 237, 0); }
    50%      { box-shadow: 0 0 28px rgba(0, 173, 237, 0.45); }
`;

// ─── building blocks ───────────────────────────────────────────

export const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(2, 6, 23, 0.78);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: grid;
    place-items: center;
    padding: 1.5rem;
    animation: ${fadeInQuick} 0.25s ease-out;
`;

export const Modal = styled.div`
    width: min(540px, 100%);
    max-height: 92vh;
    overflow-y: auto;
    border-radius: 20px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.98)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.40)')};
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
    padding: 2rem;
    animation: ${fadeIn} 0.3s ease-out;
    position: relative;
    z-index: 9999;
`;

export const Eyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
    margin-bottom: 0.6rem;
`;

export const Title = styled.h2`
    margin: 0 0 0.4rem 0;
    font-size: 1.5rem;
    font-weight: 900;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.2;
`;

export const Subtitle = styled.p`
    margin: 0 0 1.4rem 0;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.9rem;
    line-height: 1.5;
`;

export const StepIndicator = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 1.1rem;
`;

export const Pip = styled.span`
    display: inline-block;
    height: 4px;
    flex: 1;
    border-radius: 4px;
    background: ${(p) =>
        p.$active
            ? t(p, 'brand.gradient', 'linear-gradient(90deg, #00adef, #06b6d4)')
            : t(p, 'border.card', 'rgba(100, 116, 139, 0.25)')};
    transition: background 0.3s ease;
`;

export const PrimaryButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.85rem 1.2rem;
    border-radius: 12px;
    cursor: pointer;
    background: ${(p) => t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef 0%, #06b6d4 100%)')};
    color: #fff;
    border: none;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    transition: transform 0.15s ease, box-shadow 0.18s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 24px rgba(0, 173, 237, 0.40)')};
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
    }
`;

export const SkipLink = styled.button`
    display: block;
    margin: 0.85rem auto 0 auto;
    padding: 0.4rem 0.6rem;
    background: transparent;
    border: none;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-size: 0.78rem;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;

    &:hover {
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    }
`;

export const CloseButton = styled.button`
    position: absolute;
    top: 0.85rem;
    right: 0.85rem;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
        background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    }
`;

// ─── inline option/grid utilities ──────────────────────────────

export const OptionGrid = styled.div`
    display: grid;
    grid-template-columns: ${(p) => p.$cols ? `repeat(${p.$cols}, 1fr)` : 'repeat(auto-fit, minmax(140px, 1fr))'};
    gap: 0.6rem;
    margin-bottom: 1.25rem;
`;

export const OptionCard = styled.button`
    text-align: left;
    padding: 0.95rem 1rem;
    border-radius: 12px;
    cursor: pointer;
    background: ${(p) =>
        p.$active
            ? 'linear-gradient(135deg, rgba(0, 173, 237, 0.18), rgba(0, 173, 237, 0.06))'
            : t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.55)')};
    border: 1px solid ${(p) =>
        p.$active
            ? t(p, 'brand.primary', '#00adef')
            : t(p, 'border.card', 'rgba(100, 116, 139, 0.25)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    transition: transform 0.12s ease, border-color 0.18s ease;

    ${(p) => p.$active && css`
        animation: ${pulseGlow} 2.4s ease-in-out infinite;
    `}

    &:hover {
        transform: translateY(-1px);
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }

    .top {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.88rem;
        font-weight: 800;
    }

    .sub {
        display: block;
        margin-top: 0.2rem;
        font-size: 0.74rem;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        font-weight: 600;
    }

    svg {
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

export const SectionLabel = styled.div`
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    margin-bottom: 0.5rem;
`;
