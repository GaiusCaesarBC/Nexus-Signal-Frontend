// client/src/pages/marketReports/styles.js
//
// Shared themed styled-components for the redesigned Daily Market Report.
// All components consume `p.theme` (from styled-components ThemeProvider OR
// passed through as a prop) and fall back to safe defaults so they never
// strip the theme — see CRITICAL gamification vault rule.
//
// Convention: every component below is themed. Pass `theme={theme}` from a
// useTheme() consumer at the call site, e.g.:
//
//   const { theme } = useTheme();
//   <SectionCard theme={theme}> ... </SectionCard>

import styled, { keyframes } from 'styled-components';

// ---------- helpers ----------

export const t = (props, path, fallback) => {
    const segs = path.split('.');
    let cur = props.theme;
    for (const s of segs) {
        if (cur == null) return fallback;
        cur = cur[s];
    }
    return cur ?? fallback;
};

// ---------- animations ----------

export const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
`;

export const glowPulse = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.18); }
    50%      { box-shadow: 0 0 32px rgba(0, 173, 237, 0.32); }
`;

// ---------- atoms ----------

export const SectionCard = styled.div`
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.85)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.2)')};
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    animation: ${fadeIn} 0.4s ease-out both;

    @media (max-width: 640px) {
        padding: 1.1rem;
        border-radius: 12px;
    }
`;

export const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
`;

export const SectionTitle = styled.h3`
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
`;

export const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.65rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.16)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.16)'
      : p.$tone === 'warn' ? 'rgba(245, 158, 11, 0.16)'
      : 'rgba(100, 116, 139, 0.20)'};
    color: ${(p) =>
        p.$tone === 'bull' ? (t(p, 'success', '#10b981'))
      : p.$tone === 'bear' ? (t(p, 'error', '#ef4444'))
      : p.$tone === 'warn' ? (t(p, 'warning', '#f59e0b'))
      : (t(p, 'text.secondary', '#94a3b8'))};
    border: 1px solid currentColor;
    border-color: ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.35)'
      : p.$tone === 'bear' ? 'rgba(239, 68, 68, 0.35)'
      : p.$tone === 'warn' ? 'rgba(245, 158, 11, 0.35)'
      : 'rgba(100, 116, 139, 0.35)'};
`;

export const ActionButton = styled.button`
    padding: 0.6rem 1.1rem;
    border-radius: 10px;
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.3)')};
    background: ${(p) =>
        p.$primary
            ? t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef 0%, #06b6d4 100%)')
            : 'transparent'};
    color: ${(p) => (p.$primary ? '#fff' : t(p, 'brand.primary', '#00adef'))};
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 20px rgba(0, 173, 237, 0.25)')};
        background: ${(p) =>
            p.$primary
                ? t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef 0%, #06b6d4 100%)')
                : 'rgba(0, 173, 237, 0.08)'};
    }

    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
    }
`;

export const Pill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.6)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.2)')};
    font-size: 0.78rem;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-weight: 600;
`;

export const Muted = styled.span`
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.85rem;
`;

export const GlowAccent = styled.div`
    position: relative;
    &::before {
        content: '';
        position: absolute;
        inset: -1px;
        border-radius: inherit;
        background: ${(p) => t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef, #06b6d4)')};
        z-index: -1;
        opacity: 0.55;
        filter: blur(10px);
    }
`;
