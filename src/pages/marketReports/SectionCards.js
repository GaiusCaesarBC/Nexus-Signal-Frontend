// client/src/pages/marketReports/SectionCards.js
//
// Visual replacements for the old text-block sections:
//   - MarketSummaryCard   (compact highlight, ~40-60% shorter than the raw)
//   - KeyThemesCards      (icon-led bullet cards)
//   - SectorHighlightStrip (horizontal-scroll sector cards w/ tone)
//   - RiskFactorCards     (warning cards w/ severity indicators)

import React from 'react';
import styled from 'styled-components';
import {
    FileText, TrendingUp, PieChart, AlertTriangle, ArrowRight,
    ShieldAlert, ShieldCheck, Shield,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { trimSummary, parseSectorHighlights, riskSeverity } from './derive';
import {
    SectionCard, SectionHeader, SectionTitle, Muted, t, fadeIn,
} from './styles';

// ============================================================
// MARKET SUMMARY (compact highlight)
// ============================================================

const SummaryBody = styled.div`
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.96rem;
    line-height: 1.6;
    padding: 0.85rem 1rem;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.5)')};
    border-left: 3px solid ${(p) => t(p, 'brand.primary', '#00adef')};
    border-radius: 8px;
`;

export const MarketSummaryCard = ({ summary }) => {
    const { theme } = useTheme();
    if (!summary) return null;
    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <FileText size={14} /> Market Summary
                </SectionTitle>
            </SectionHeader>
            <SummaryBody theme={theme}>{trimSummary(summary)}</SummaryBody>
        </SectionCard>
    );
};

// ============================================================
// KEY THEMES (icon cards in a grid)
// ============================================================

const ThemeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.7rem;
`;

const ThemeCard = styled.div`
    display: flex;
    gap: 0.7rem;
    align-items: flex-start;
    padding: 0.85rem 1rem;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.5)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
    border-radius: 10px;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.9rem;
    line-height: 1.45;
    transition: border-color 0.2s ease, transform 0.15s ease;
    animation: ${fadeIn} 0.4s ease-out both;

    &:hover {
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
        transform: translateY(-1px);
    }

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

export const KeyThemesCards = ({ themes }) => {
    const { theme } = useTheme();
    if (!themes?.length) return null;
    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <TrendingUp size={14} /> Key Themes Today
                </SectionTitle>
            </SectionHeader>
            <ThemeGrid>
                {themes.map((th, i) => (
                    <ThemeCard key={i} theme={theme}>
                        <TrendingUp size={16} />
                        <span>{th}</span>
                    </ThemeCard>
                ))}
            </ThemeGrid>
        </SectionCard>
    );
};

// ============================================================
// SECTOR HIGHLIGHTS (horizontal scroll cards w/ tone)
// ============================================================

const Scroller = styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(240px, 1fr);
    gap: 0.85rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    scroll-snap-type: x mandatory;

    /* hide scrollbar visually but keep accessible */
    scrollbar-width: thin;
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-thumb {
        background: rgba(100, 116, 139, 0.35);
        border-radius: 4px;
    }
`;

const SectorTile = styled.div`
    scroll-snap-align: start;
    padding: 1rem 1.1rem;
    border-radius: 12px;
    background: ${(p) =>
        p.$tone === 'bullish' ? 'rgba(16, 185, 129, 0.10)'
      : p.$tone === 'bearish' ? 'rgba(239, 68, 68, 0.10)'
      : (t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.5)'))};
    border: 1px solid ${(p) =>
        p.$tone === 'bullish' ? 'rgba(16, 185, 129, 0.35)'
      : p.$tone === 'bearish' ? 'rgba(239, 68, 68, 0.35)'
      : t(p, 'border.card', 'rgba(100, 116, 139, 0.2)')};

    .sector-name {
        font-weight: 800;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        font-size: 0.95rem;
        margin-bottom: 0.35rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
    }
    .sector-tone {
        display: inline-block;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        padding: 0.15rem 0.45rem;
        border-radius: 999px;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        background: ${(p) =>
            p.$tone === 'bullish' ? 'rgba(16, 185, 129, 0.18)'
          : p.$tone === 'bearish' ? 'rgba(239, 68, 68, 0.18)'
          : 'rgba(100, 116, 139, 0.20)'};
        color: ${(p) =>
            p.$tone === 'bullish' ? t(p, 'success', '#10b981')
          : p.$tone === 'bearish' ? t(p, 'error', '#ef4444')
          : t(p, 'text.secondary', '#94a3b8')};
    }
    .sector-note {
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
        font-size: 0.85rem;
        line-height: 1.45;
    }
`;

export const SectorHighlightStrip = ({ sectorHighlights }) => {
    const { theme } = useTheme();
    const cards = parseSectorHighlights(sectorHighlights);
    if (!cards.length) return null;

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <PieChart size={14} /> Sector Highlights
                </SectionTitle>
                <Muted theme={theme}>Scroll to see more →</Muted>
            </SectionHeader>
            <Scroller>
                {cards.map((c, i) => (
                    <SectorTile key={i} theme={theme} $tone={c.tone}>
                        <div className="sector-name">
                            <ArrowRight size={14} /> {c.name}
                        </div>
                        <div className="sector-tone">{c.tone}</div>
                        <div className="sector-note">{c.note}</div>
                    </SectorTile>
                ))}
            </Scroller>
        </SectionCard>
    );
};

// ============================================================
// RISK FACTORS (warning cards w/ severity)
// ============================================================

const RiskGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 0.7rem;
`;

const RiskCard = styled.div`
    display: flex;
    gap: 0.75rem;
    padding: 0.9rem 1rem;
    border-radius: 10px;
    background: ${(p) =>
        p.$sev === 'high' ? 'rgba(239, 68, 68, 0.10)'
      : p.$sev === 'med' ? 'rgba(245, 158, 11, 0.10)'
      : 'rgba(100, 116, 139, 0.10)'};
    border: 1px solid ${(p) =>
        p.$sev === 'high' ? 'rgba(239, 68, 68, 0.35)'
      : p.$sev === 'med' ? 'rgba(245, 158, 11, 0.35)'
      : 'rgba(100, 116, 139, 0.30)'};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.88rem;
    line-height: 1.45;
    align-items: flex-start;
    animation: ${fadeIn} 0.4s ease-out both;

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: ${(p) =>
            p.$sev === 'high' ? t(p, 'error', '#ef4444')
          : p.$sev === 'med' ? t(p, 'warning', '#f59e0b')
          : t(p, 'text.secondary', '#94a3b8')};
    }
`;

const SevTag = styled.span`
    display: inline-block;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    text-transform: uppercase;
    margin-right: 0.4rem;
    background: ${(p) =>
        p.$sev === 'high' ? 'rgba(239, 68, 68, 0.20)'
      : p.$sev === 'med' ? 'rgba(245, 158, 11, 0.20)'
      : 'rgba(100, 116, 139, 0.20)'};
    color: ${(p) =>
        p.$sev === 'high' ? t(p, 'error', '#ef4444')
      : p.$sev === 'med' ? t(p, 'warning', '#f59e0b')
      : t(p, 'text.secondary', '#94a3b8')};
`;

const sevIcon = (sev) => sev === 'high' ? ShieldAlert : sev === 'med' ? Shield : ShieldCheck;

export const RiskFactorCards = ({ risks }) => {
    const { theme } = useTheme();
    if (!risks?.length) return null;
    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <AlertTriangle size={14} /> Risk Factors
                </SectionTitle>
            </SectionHeader>
            <RiskGrid>
                {risks.map((r, i) => {
                    const sev = riskSeverity(r);
                    const Icon = sevIcon(sev);
                    return (
                        <RiskCard key={i} theme={theme} $sev={sev}>
                            <Icon size={18} />
                            <div>
                                <SevTag theme={theme} $sev={sev}>{sev}</SevTag>
                                {r}
                            </div>
                        </RiskCard>
                    );
                })}
            </RiskGrid>
        </SectionCard>
    );
};
