// client/src/pages/HowItWorksPage.js
//
// Standalone "How It Works" page — a transparent breakdown of how Nexus
// Signal AI discovers, scores, generates, and tracks every trade.
//
// Goal: build trust through transparency. Every section answers "what
// does this thing actually do?" without marketing fluff or jargon.
//
// Self-contained: all styled-components live inline so the page can be
// dropped in without depending on shared atoms.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import {
    BookOpen, Zap, Search, Activity, Brain, Target, Eye, Shield,
    TrendingUp, TrendingDown, BarChart3, Layers, Volume2, Flame,
    LineChart, CheckCircle2, XCircle, Lock, ArrowRight, Sparkles,
    Award, Clock, RefreshCw, AlertTriangle, Crosshair, Compass,
    GitBranch, Gauge, MessageSquare, Star, ChevronRight, FlaskConical,
    Bell,
} from 'lucide-react';
import SEO from '../components/SEO';

// ─────────────────────────────────────────────────────────────────
// Theme helper — falls back if a theme key is missing
// ─────────────────────────────────────────────────────────────────
const t = (props, path, fallback) => {
    const segs = path.split('.');
    let cur = props.theme;
    for (const s of segs) {
        if (cur == null) return fallback;
        cur = cur[s];
    }
    return cur ?? fallback;
};

// ─────────────────────────────────────────────────────────────────
// Animations
// ─────────────────────────────────────────────────────────────────
const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
    from { opacity: 0; }
    to   { opacity: 1; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-4px); }
`;

const pulseGlow = keyframes`
    0%, 100% { box-shadow: 0 0 0 rgba(0, 173, 237, 0); }
    50%      { box-shadow: 0 0 32px rgba(0, 173, 237, 0.30); }
`;

// ─────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────
const Page = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 4rem;
    background: transparent;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};

    @media (max-width: 640px) {
        padding: 5rem 1rem 3rem;
    }
`;

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const Section = styled.section`
    margin-bottom: 5rem;
    animation: ${fadeInUp} 0.7s ease-out both;
    animation-delay: ${(p) => p.$delay || '0s'};
`;

const SectionHead = styled.div`
    text-align: center;
    margin-bottom: 2.5rem;
`;

const Eyebrow = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
    background: rgba(0, 173, 237, 0.10);
    border: 1px solid rgba(0, 173, 237, 0.30);
    margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
    margin: 0 0 0.7rem 0;
    font-size: 2rem;
    font-weight: 900;
    line-height: 1.15;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};

    @media (max-width: 640px) { font-size: 1.55rem; }
`;

const SectionLead = styled.p`
    max-width: 720px;
    margin: 0 auto;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 1rem;
    line-height: 1.6;
`;

// ─────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────
const Hero = styled.div`
    text-align: center;
    margin-bottom: 4rem;
    padding-top: 1rem;
    animation: ${fadeIn} 0.8s ease-out both;
`;

const HeroBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.15), rgba(168, 85, 247, 0.10));
    border: 1px solid rgba(0, 173, 237, 0.35);
    margin-bottom: 1.4rem;
    animation: ${float} 4s ease-in-out infinite;
`;

const HeroTitle = styled.h1`
    margin: 0 0 1rem 0;
    font-size: 3.4rem;
    font-weight: 900;
    line-height: 1.1;
    background: linear-gradient(135deg, #00adef 0%, #06b6d4 50%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (max-width: 768px) { font-size: 2.4rem; }
    @media (max-width: 480px) { font-size: 1.95rem; }
`;

const HeroSub = styled.p`
    max-width: 780px;
    margin: 0 auto 2rem;
    font-size: 1.15rem;
    line-height: 1.6;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};

    @media (max-width: 640px) { font-size: 1rem; }
`;

const ProofStrip = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.65rem;
    margin: 0 auto;
    max-width: 980px;
`;

const ProofPill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.55rem 1rem;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(16, 185, 129, 0.35);
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.85rem;
    font-weight: 700;

    svg { color: #10b981; flex: 0 0 auto; }
`;

// ─────────────────────────────────────────────────────────────────
// Step cards (5-step system)
// ─────────────────────────────────────────────────────────────────
const StepGrid = styled.div`
    display: grid;
    gap: 1.25rem;
`;

const StepCard = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: 64px 1fr;
    gap: 1.5rem;
    padding: 1.75rem;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    border-radius: 18px;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: linear-gradient(90deg, #00adef, #06b6d4, transparent);
    }

    &:hover {
        transform: translateY(-3px);
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
    }

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
        padding: 1.4rem;
        gap: 1rem;
    }
`;

const StepNumber = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.20), rgba(0, 173, 237, 0.04));
    border: 1px solid rgba(0, 173, 237, 0.40);
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
    font-size: 1.5rem;
    font-weight: 900;
    flex: 0 0 auto;
`;

const StepBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    min-width: 0;
`;

const StepTop = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const StepKicker = styled.span`
    font-size: 0.62rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const StepTitle = styled.h3`
    margin: 0;
    font-size: 1.4rem;
    font-weight: 900;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    line-height: 1.2;

    @media (max-width: 640px) { font-size: 1.2rem; }
`;

const StepLead = styled.p`
    margin: 0;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.95rem;
    line-height: 1.55;
`;

const SubGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.55rem;
    margin-top: 0.6rem;
`;

const SubItem = styled.div`
    padding: 0.65rem 0.85rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.55)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};

    svg {
        flex: 0 0 auto;
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

// Scoring weights
const WeightBar = styled.div`
    margin-top: 0.85rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
`;

const Weight = styled.div`
    .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.3rem;
        font-size: 0.78rem;
        font-weight: 700;
    }
    .name {
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        display: flex;
        align-items: center;
        gap: 0.45rem;
    }
    .pct {
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
        font-weight: 800;
    }
    .desc {
        margin-top: 0.3rem;
        font-size: 0.78rem;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        line-height: 1.4;
    }
    .track {
        height: 6px;
        border-radius: 4px;
        background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
        overflow: hidden;
    }
    .fill {
        height: 100%;
        background: linear-gradient(90deg, #00adef, #06b6d4);
        transition: width 0.6s ease;
    }
`;

// Trade level table (Step 4)
const LevelGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-top: 0.6rem;

    @media (max-width: 640px) {
        grid-template-columns: 1fr;
    }
`;

const LevelBlock = styled.div`
    padding: 1rem 1.1rem;
    border-radius: 12px;
    background: ${(p) =>
        p.$kind === 'long'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.10), rgba(16, 185, 129, 0.02))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.10), rgba(239, 68, 68, 0.02))'};
    border: 1px solid ${(p) =>
        p.$kind === 'long' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'};

    .head {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.7rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: ${(p) => p.$kind === 'long' ? '#10b981' : '#ef4444'};
        margin-bottom: 0.6rem;
    }
    .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.4rem 0;
        border-bottom: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
        font-size: 0.85rem;
    }
    .row:last-child { border-bottom: none; }
    .label {
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
        font-weight: 700;
    }
    .val {
        color: ${(p) => p.$kind === 'long' ? '#10b981' : '#ef4444'};
        font-weight: 900;
    }
`;

// ─────────────────────────────────────────────────────────────────
// Indicators grid
// ─────────────────────────────────────────────────────────────────
const IndicatorGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 0.85rem;
`;

const IndicatorCard = styled.div`
    padding: 1.1rem;
    border-radius: 14px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.65)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    transition: transform 0.18s ease, border-color 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }

    .top {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        margin-bottom: 0.45rem;
    }
    .icon {
        width: 32px;
        height: 32px;
        border-radius: 9px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.20), rgba(0, 173, 237, 0.04));
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
        flex: 0 0 auto;
    }
    .name {
        font-size: 0.95rem;
        font-weight: 800;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    }
    .body {
        font-size: 0.82rem;
        line-height: 1.5;
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    }
`;

// ─────────────────────────────────────────────────────────────────
// Confidence section
// ─────────────────────────────────────────────────────────────────
const ConfidenceWrap = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
    gap: 1.5rem;
    align-items: start;

    @media (max-width: 880px) {
        grid-template-columns: 1fr;
    }
`;

const ConfidenceText = styled.div`
    padding: 1.5rem;
    border-radius: 18px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.65)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};

    h3 {
        margin: 0 0 0.6rem 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        display: flex;
        align-items: center;
        gap: 0.5rem;

        svg { color: ${(p) => t(p, 'brand.primary', '#00adef')}; }
    }
    p {
        margin: 0 0 0.85rem 0;
        font-size: 0.92rem;
        line-height: 1.6;
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    }
    p:last-child { margin-bottom: 0; }
`;

const TierStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
`;

const TierCard = styled.div`
    padding: 1rem 1.15rem;
    border-radius: 14px;
    background: ${(p) =>
        p.$tone === 'bull' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.02))'
      : p.$tone === 'warn' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.02))'
      : 'linear-gradient(135deg, rgba(100, 116, 139, 0.12), rgba(100, 116, 139, 0.02))'};
    border: 1px solid ${(p) =>
        p.$tone === 'bull' ? 'rgba(16, 185, 129, 0.35)'
      : p.$tone === 'warn' ? 'rgba(245, 158, 11, 0.35)'
      : 'rgba(100, 116, 139, 0.30)'};

    .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.35rem;
    }
    .label {
        font-size: 0.85rem;
        font-weight: 800;
        color: ${(p) =>
            p.$tone === 'bull' ? '#10b981'
          : p.$tone === 'warn' ? '#f59e0b'
          : t(p, 'text.tertiary', '#94a3b8')};
    }
    .pct {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        background: rgba(15, 23, 42, 0.7);
        color: ${(p) =>
            p.$tone === 'bull' ? '#10b981'
          : p.$tone === 'warn' ? '#f59e0b'
          : t(p, 'text.tertiary', '#94a3b8')};
        border: 1px solid currentColor;
    }
    .desc {
        font-size: 0.8rem;
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
        line-height: 1.45;
    }
`;

// ─────────────────────────────────────────────────────────────────
// Tracking — list of bullets in a single panel
// ─────────────────────────────────────────────────────────────────
const TrackingPanel = styled.div`
    padding: 2rem;
    border-radius: 18px;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(16, 185, 129, 0.10) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid rgba(16, 185, 129, 0.30);
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: linear-gradient(90deg, #10b981, #00adef);
    }
`;

const TrackingList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 0.75rem;
`;

const TrackingItem = styled.li`
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    padding: 0.85rem 1rem;
    border-radius: 11px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.6)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.45;

    svg {
        flex: 0 0 auto;
        margin-top: 2px;
        color: #10b981;
    }
`;

// ─────────────────────────────────────────────────────────────────
// Comparison (Most Signal Groups vs Nexus)
// ─────────────────────────────────────────────────────────────────
const CompareGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const CompareCard = styled.div`
    padding: 1.75rem;
    border-radius: 18px;
    background: ${(p) =>
        p.$kind === 'them' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.10), rgba(239, 68, 68, 0.02))'
        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(0, 173, 237, 0.06))'};
    border: 1px solid ${(p) =>
        p.$kind === 'them' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.45)'};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: ${(p) => p.$kind === 'them'
            ? 'linear-gradient(90deg, #ef4444, transparent)'
            : 'linear-gradient(90deg, #10b981, #00adef)'};
    }
`;

const CompareTitle = styled.h3`
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${(p) => p.$kind === 'them' ? '#fca5a5' : '#86efac'};
`;

const CompareList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;

    li {
        display: flex;
        align-items: flex-start;
        gap: 0.55rem;
        font-size: 0.9rem;
        line-height: 1.5;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};

        svg {
            flex: 0 0 auto;
            margin-top: 2px;
        }
    }
`;

// ─────────────────────────────────────────────────────────────────
// What users actually do
// ─────────────────────────────────────────────────────────────────
const ActionGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 0.85rem;
`;

const ActionCard = styled.div`
    padding: 1.2rem;
    border-radius: 14px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.7)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    text-align: center;
    transition: transform 0.18s ease, border-color 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }

    .icon {
        width: 44px;
        height: 44px;
        margin: 0 auto 0.6rem;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.20), rgba(0, 173, 237, 0.04));
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
    .name {
        font-size: 0.95rem;
        font-weight: 900;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        margin-bottom: 0.3rem;
    }
    .desc {
        font-size: 0.78rem;
        line-height: 1.45;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    }
`;

// ─────────────────────────────────────────────────────────────────
// Final CTA
// ─────────────────────────────────────────────────────────────────
const CTAPanel = styled.div`
    padding: 3rem 2rem;
    border-radius: 24px;
    text-align: center;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(0, 173, 237, 0.16) 0%, transparent 55%),
        radial-gradient(120% 120% at 100% 100%, rgba(168, 85, 247, 0.14) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.95)')};
    border: 1px solid rgba(0, 173, 237, 0.40);
    animation: ${pulseGlow} 4s ease-in-out infinite;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        background: linear-gradient(90deg, #00adef, #06b6d4, #a855f7);
    }
`;

const CTATitle = styled.h2`
    margin: 0 0 0.7rem 0;
    font-size: 2.1rem;
    font-weight: 900;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};

    @media (max-width: 640px) { font-size: 1.6rem; }
`;

const CTASub = styled.p`
    max-width: 580px;
    margin: 0 auto 1.75rem;
    font-size: 1rem;
    line-height: 1.6;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
`;

const CTAButtons = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const CTAPrimary = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.95rem 1.75rem;
    border-radius: 12px;
    cursor: pointer;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: #fff;
    border: none;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    transition: transform 0.15s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 36px rgba(249, 115, 22, 0.45);
    }
`;

const CTASecondary = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.95rem 1.75rem;
    border-radius: 12px;
    cursor: pointer;
    background: transparent;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.40)')};
    font-size: 0.95rem;
    font-weight: 700;
    transition: transform 0.15s ease, background 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        background: rgba(0, 173, 237, 0.10);
    }
`;

// ═════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════
const HowItWorksPage = () => {
    const navigate = useNavigate();

    return (
        <Page>
            <SEO
                title="How It Works — Every Trade Explained | Nexus Signal AI"
                description="The full breakdown: how Nexus discovers assets, scores setups, builds trades, and tracks results. 300+ trades public. No deletions, no edits."
                keywords="how it works, AI trading signals, trade transparency, signal accuracy, live tracking, XGBoost trading"
                url="https://nexussignal.ai/how-it-works"
            />

            <Container>
                {/* ─── HERO ─── */}
                <Hero>
                    <HeroBadge><BookOpen size={13} /> Built In The Open</HeroBadge>
                    <HeroTitle>How Nexus Signal AI Works</HeroTitle>
                    <HeroSub>
                        A transparent breakdown of how we discover, score, generate, and track every trade.
                        No black boxes. No cherry-picked screenshots. Every win and loss is public.
                    </HeroSub>
                    <ProofStrip>
                        <ProofPill><CheckCircle2 size={14} /> 300+ tracked trades</ProofPill>
                        <ProofPill><RefreshCw size={14} /> Hourly signal generation</ProofPill>
                        <ProofPill><Clock size={14} /> Results checked every 5 minutes</ProofPill>
                        <ProofPill><Lock size={14} /> No deleted or edited trades</ProofPill>
                    </ProofStrip>
                </Hero>

                {/* ─── 5-STEP SYSTEM ─── */}
                <Section $delay="0.1s">
                    <SectionHead>
                        <Eyebrow><Zap size={11} /> The System</Eyebrow>
                        <SectionTitle>Five steps from market noise to a real trade</SectionTitle>
                        <SectionLead>
                            Every signal you see goes through the same five stages.
                            Nothing gets hand-picked, nothing gets pulled out of the loop.
                        </SectionLead>
                    </SectionHead>

                    <StepGrid>
                        {/* STEP 1 — Market Discovery */}
                        <StepCard>
                            <StepNumber>1</StepNumber>
                            <StepBody>
                                <StepTop>
                                    <StepKicker>Step 1</StepKicker>
                                </StepTop>
                                <StepTitle>Market Discovery</StepTitle>
                                <StepLead>
                                    Nexus continuously scans both stocks and crypto to find assets that are
                                    actually doing something. Most of the market is noise; we filter for the
                                    rare moments where the data lines up.
                                </StepLead>
                                <SubGrid>
                                    <SubItem><Volume2 size={14} /> Volume surges</SubItem>
                                    <SubItem><TrendingUp size={14} /> Price momentum</SubItem>
                                    <SubItem><Gauge size={14} /> Volatility spikes</SubItem>
                                    <SubItem><Activity size={14} /> Relative volume</SubItem>
                                    <SubItem><LineChart size={14} /> Price movement</SubItem>
                                </SubGrid>
                                <StepLead style={{ marginTop: '0.6rem' }}>
                                    Discoveries are sorted into four buckets so the system always knows
                                    why an asset showed up:
                                </StepLead>
                                <SubGrid>
                                    <SubItem><Flame size={14} /> Trending</SubItem>
                                    <SubItem><Crosshair size={14} /> Breakout Watch</SubItem>
                                    <SubItem><GitBranch size={14} /> Reversal Setup</SubItem>
                                    <SubItem><Eye size={14} /> Watchlist</SubItem>
                                </SubGrid>
                            </StepBody>
                        </StepCard>

                        {/* STEP 2 — Scoring System */}
                        <StepCard>
                            <StepNumber>2</StepNumber>
                            <StepBody>
                                <StepTop>
                                    <StepKicker>Step 2</StepKicker>
                                </StepTop>
                                <StepTitle>Scoring System</StepTitle>
                                <StepLead>
                                    Each candidate gets a setup score from 0–100. The score is a fixed
                                    blend of five inputs — same weights every time, no overrides.
                                </StepLead>
                                <WeightBar>
                                    <Weight>
                                        <div className="top">
                                            <span className="name"><Layers size={13} /> Liquidity</span>
                                            <span className="pct">20%</span>
                                        </div>
                                        <div className="track"><div className="fill" style={{ width: '20%' }} /></div>
                                        <div className="desc">Can you actually get in and out at the price you see? Thin markets get penalized.</div>
                                    </Weight>
                                    <Weight>
                                        <div className="top">
                                            <span className="name"><TrendingUp size={13} /> Movement</span>
                                            <span className="pct">25%</span>
                                        </div>
                                        <div className="track"><div className="fill" style={{ width: '25%' }} /></div>
                                        <div className="desc">How much the price has moved in the recent window. Stronger moves mean tradeable trends.</div>
                                    </Weight>
                                    <Weight>
                                        <div className="top">
                                            <span className="name"><Volume2 size={13} /> Relative Volume</span>
                                            <span className="pct">25%</span>
                                        </div>
                                        <div className="track"><div className="fill" style={{ width: '25%' }} /></div>
                                        <div className="desc">Volume vs the asset's own average. Money following price is the strongest confirmation.</div>
                                    </Weight>
                                    <Weight>
                                        <div className="top">
                                            <span className="name"><Activity size={13} /> Momentum</span>
                                            <span className="pct">20%</span>
                                        </div>
                                        <div className="track"><div className="fill" style={{ width: '20%' }} /></div>
                                        <div className="desc">Is the move accelerating or fading? Momentum-based filters pick up the second.</div>
                                    </Weight>
                                    <Weight>
                                        <div className="top">
                                            <span className="name"><Gauge size={13} /> Volatility</span>
                                            <span className="pct">10%</span>
                                        </div>
                                        <div className="track"><div className="fill" style={{ width: '10%' }} /></div>
                                        <div className="desc">A small dose of volatility is healthy; too much and the score drops.</div>
                                    </Weight>
                                </WeightBar>
                            </StepBody>
                        </StepCard>

                        {/* STEP 3 — AI Prediction Layer */}
                        <StepCard>
                            <StepNumber>3</StepNumber>
                            <StepBody>
                                <StepTop>
                                    <StepKicker>Step 3</StepKicker>
                                </StepTop>
                                <StepTitle>AI Prediction Layer</StepTitle>
                                <StepLead>
                                    Once an asset survives discovery and scoring, the prediction engine
                                    evaluates it. It assigns a direction (LONG or SHORT), a confidence
                                    score, and rejects setups that don't meet a minimum threshold.
                                    Stronger setups move forward; everything else is dropped.
                                </StepLead>
                                <SubGrid>
                                    <SubItem><Brain size={14} /> XGBoost + LightGBM ensemble</SubItem>
                                    <SubItem><Clock size={14} /> 7-day forecast horizon</SubItem>
                                    <SubItem><Target size={14} /> Confidence thresholding</SubItem>
                                    <SubItem><Shield size={14} /> Weak setups filtered out</SubItem>
                                </SubGrid>
                                <StepLead style={{ marginTop: '0.6rem' }}>
                                    XGBoost and LightGBM are both gradient-boosting models — they learn
                                    from historical price + indicator patterns. Using two together (an
                                    "ensemble") is a standard way to reduce single-model bias.
                                </StepLead>
                            </StepBody>
                        </StepCard>

                        {/* STEP 4 — Trade Construction */}
                        <StepCard>
                            <StepNumber>4</StepNumber>
                            <StepBody>
                                <StepTop>
                                    <StepKicker>Step 4</StepKicker>
                                </StepTop>
                                <StepTitle>Trade Construction</StepTitle>
                                <StepLead>
                                    Once direction + confidence are decided, Nexus builds the actual
                                    trade. Stop loss and take-profit levels are fixed at signal creation
                                    using the same rules every time, so nothing can be moved after the fact.
                                </StepLead>
                                <LevelGrid>
                                    <LevelBlock $kind="long">
                                        <div className="head"><TrendingUp size={12} /> LONG Trades</div>
                                        <div className="row"><span className="label">Stop Loss</span><span className="val">−2%</span></div>
                                        <div className="row"><span className="label">Take Profit 1</span><span className="val">+2%</span></div>
                                        <div className="row"><span className="label">Take Profit 2</span><span className="val">+5%</span></div>
                                        <div className="row"><span className="label">Take Profit 3</span><span className="val">+8%</span></div>
                                    </LevelBlock>
                                    <LevelBlock $kind="short">
                                        <div className="head"><TrendingDown size={12} /> SHORT Trades</div>
                                        <div className="row"><span className="label">Stop Loss</span><span className="val">+2%</span></div>
                                        <div className="row"><span className="label">Take Profit 1</span><span className="val">−2%</span></div>
                                        <div className="row"><span className="label">Take Profit 2</span><span className="val">−5%</span></div>
                                        <div className="row"><span className="label">Take Profit 3</span><span className="val">−8%</span></div>
                                    </LevelBlock>
                                </LevelGrid>
                                <SubGrid>
                                    <SubItem><Compass size={14} /> Risk/reward calculated</SubItem>
                                    <SubItem><CheckCircle2 size={14} /> Levels validated</SubItem>
                                    <SubItem><XCircle size={14} /> Bad setups rejected</SubItem>
                                </SubGrid>
                            </StepBody>
                        </StepCard>

                        {/* STEP 5 — Live Tracking & Results */}
                        <StepCard>
                            <StepNumber>5</StepNumber>
                            <StepBody>
                                <StepTop>
                                    <StepKicker>Step 5</StepKicker>
                                </StepTop>
                                <StepTitle>Live Tracking & Results</StepTitle>
                                <StepLead>
                                    Once a signal is published, the system takes over. Prices are checked
                                    every 5 minutes against the locked entry, stop loss, and take-profit
                                    levels. Whatever happens — win, loss, or expiry — gets logged
                                    automatically and rolled into the public stats page.
                                </StepLead>
                                <SubGrid>
                                    <SubItem><Clock size={14} /> Checked every 5 minutes</SubItem>
                                    <SubItem><CheckCircle2 size={14} /> TP/SL outcomes auto-logged</SubItem>
                                    <SubItem><AlertTriangle size={14} /> 7-day expiry if no target hit</SubItem>
                                    <SubItem><BarChart3 size={14} /> Wins + losses both counted</SubItem>
                                </SubGrid>
                            </StepBody>
                        </StepCard>
                    </StepGrid>
                </Section>

                {/* ─── INDICATORS & INPUTS ─── */}
                <Section $delay="0.15s">
                    <SectionHead>
                        <Eyebrow><Activity size={11} /> Inputs</Eyebrow>
                        <SectionTitle>The indicators that feed the system</SectionTitle>
                        <SectionLead>
                            These are the actual signals the engine reads from the tape. Each one is
                            a single number; together they paint a picture.
                        </SectionLead>
                    </SectionHead>

                    <IndicatorGrid>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><Activity size={16} /></div>
                                <div className="name">RSI</div>
                            </div>
                            <div className="body">
                                Tells us when an asset has run too hot or too cold — overbought above 70,
                                oversold below 30.
                            </div>
                        </IndicatorCard>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><GitBranch size={16} /></div>
                                <div className="name">MACD Signal</div>
                            </div>
                            <div className="body">
                                Crossovers between two moving averages flag the moment momentum starts
                                to flip direction.
                            </div>
                        </IndicatorCard>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><Volume2 size={16} /></div>
                                <div className="name">Volume Status</div>
                            </div>
                            <div className="body">
                                Raw volume confirms whether a price move has real money behind it or
                                it's just thin-tape drift.
                            </div>
                        </IndicatorCard>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><Gauge size={16} /></div>
                                <div className="name">Volatility</div>
                            </div>
                            <div className="body">
                                Measures how aggressively the price is swinging — used both for sizing
                                and to filter out chop.
                            </div>
                        </IndicatorCard>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><BarChart3 size={16} /></div>
                                <div className="name">Relative Volume</div>
                            </div>
                            <div className="body">
                                Today's volume vs the asset's own average. A 2x spike usually means
                                something is happening.
                            </div>
                        </IndicatorCard>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><LineChart size={16} /></div>
                                <div className="name">Price Movement</div>
                            </div>
                            <div className="body">
                                Net price change across short and medium windows. The trend has to be
                                going somewhere to count.
                            </div>
                        </IndicatorCard>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><TrendingUp size={16} /></div>
                                <div className="name">Trend Consistency</div>
                            </div>
                            <div className="body">
                                Are higher-highs and higher-lows actually stacking, or is the move
                                random and choppy?
                            </div>
                        </IndicatorCard>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><MessageSquare size={16} /></div>
                                <div className="name">Sentiment Context</div>
                            </div>
                            <div className="body">
                                Headlines and news tone around the asset — used as a sanity check, not
                                a primary signal.
                            </div>
                        </IndicatorCard>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><Compass size={16} /></div>
                                <div className="name">Market Conditions</div>
                            </div>
                            <div className="body">
                                Broader market regime — risk-on, risk-off, or mixed. A great single
                                setup loses against a bad tape.
                            </div>
                        </IndicatorCard>
                        <IndicatorCard>
                            <div className="top">
                                <div className="icon"><CheckCircle2 size={16} /></div>
                                <div className="name">Confirmation Alignment</div>
                            </div>
                            <div className="body">
                                The number of independent signals that agree. More agreement → higher
                                final confidence.
                            </div>
                        </IndicatorCard>
                    </IndicatorGrid>
                </Section>

                {/* ─── HOW CONFIDENCE WORKS ─── */}
                <Section $delay="0.2s">
                    <SectionHead>
                        <Eyebrow><Brain size={11} /> Confidence</Eyebrow>
                        <SectionTitle>What that confidence number actually means</SectionTitle>
                        <SectionLead>
                            Confidence isn't a guarantee — it's a measure of how strongly the system's
                            inputs agree on a setup.
                        </SectionLead>
                    </SectionHead>

                    <ConfidenceWrap>
                        <ConfidenceText>
                            <h3><Brain size={18} /> How we read the score</h3>
                            <p>
                                When you see a "72% confidence" signal, that doesn't mean the trade
                                has a 72% chance of winning. It means the system's checks agreed
                                strongly enough to publish it.
                            </p>
                            <p>
                                More indicators agreeing → stronger alignment → higher confidence.
                                When inputs disagree, the score drops, and the lowest-quality setups
                                are filtered out before you ever see them.
                            </p>
                            <p>
                                Confidence is one input. The R/R structure, market context, and the
                                broader tape all matter too. We show it because it's useful, not
                                because it's a fortune-teller.
                            </p>
                        </ConfidenceText>

                        <TierStack>
                            <TierCard $tone="bull">
                                <div className="top">
                                    <span className="label">Strong Setup</span>
                                    <span className="pct">70%+</span>
                                </div>
                                <div className="desc">High alignment across indicators. These are the headline trades on the Signals page.</div>
                            </TierCard>
                            <TierCard $tone="warn">
                                <div className="top">
                                    <span className="label">Moderate Setup</span>
                                    <span className="pct">65–69%</span>
                                </div>
                                <div className="desc">Decent alignment. Worth watching but rarely worth oversizing.</div>
                            </TierCard>
                            <TierCard $tone="mute">
                                <div className="top">
                                    <span className="label">Filtered Out</span>
                                    <span className="pct">&lt; 65%</span>
                                </div>
                                <div className="desc">Hidden or deprioritized — the inputs simply don't agree strongly enough to publish.</div>
                            </TierCard>
                        </TierStack>
                    </ConfidenceWrap>
                </Section>

                {/* ─── HOW RESULTS ARE TRACKED ─── */}
                <Section $delay="0.25s">
                    <SectionHead>
                        <Eyebrow><Eye size={11} /> Tracking</Eyebrow>
                        <SectionTitle>How results are tracked (and why we can't fake them)</SectionTitle>
                        <SectionLead>
                            The system is built so even we can't quietly delete a losing trade.
                            Once a signal is published, here's what happens to it.
                        </SectionLead>
                    </SectionHead>

                    <TrackingPanel>
                        <TrackingList>
                            <TrackingItem>
                                <Lock size={16} />
                                Entry price is locked the moment the signal is created — not "set later"
                            </TrackingItem>
                            <TrackingItem>
                                <Shield size={16} />
                                Stop loss and all three take-profit targets are fixed at the same time
                            </TrackingItem>
                            <TrackingItem>
                                <Clock size={16} />
                                Live price is checked every 5 minutes against those locked levels
                            </TrackingItem>
                            <TrackingItem>
                                <CheckCircle2 size={16} />
                                Outcome (TP1 / TP2 / TP3 / SL / expiry) is logged automatically
                            </TrackingItem>
                            <TrackingItem>
                                <XCircle size={16} />
                                No deleting. No editing. Losses count just as much as wins.
                            </TrackingItem>
                            <TrackingItem>
                                <AlertTriangle size={16} />
                                Trades that don't hit a target within 7 days expire and are still counted
                            </TrackingItem>
                        </TrackingList>
                    </TrackingPanel>
                </Section>

                {/* ─── COMPARISON ─── */}
                <Section $delay="0.3s">
                    <SectionHead>
                        <Eyebrow><Award size={11} /> The Difference</Eyebrow>
                        <SectionTitle>Why Nexus isn't like a Telegram signal group</SectionTitle>
                        <SectionLead>
                            Most signal services are great at marketing and bad at honesty.
                            Here's the side-by-side.
                        </SectionLead>
                    </SectionHead>

                    <CompareGrid>
                        <CompareCard $kind="them">
                            <CompareTitle $kind="them"><XCircle size={18} /> Most signal groups</CompareTitle>
                            <CompareList>
                                <li><XCircle size={14} color="#fca5a5" /> Show only winners — losers get scrubbed</li>
                                <li><XCircle size={14} color="#fca5a5" /> Move stops "after the fact" to fake wins</li>
                                <li><XCircle size={14} color="#fca5a5" /> Vague trade calls without entry/SL/TP</li>
                                <li><XCircle size={14} color="#fca5a5" /> No public performance history</li>
                                <li><XCircle size={14} color="#fca5a5" /> Trust based on screenshots, not data</li>
                            </CompareList>
                        </CompareCard>
                        <CompareCard $kind="us">
                            <CompareTitle $kind="us"><CheckCircle2 size={18} /> Nexus Signal AI</CompareTitle>
                            <CompareList>
                                <li><CheckCircle2 size={14} color="#86efac" /> Every trade tracked publicly — wins and losses</li>
                                <li><CheckCircle2 size={14} color="#86efac" /> Fixed SL / TP1 / TP2 / TP3 structure, locked at entry</li>
                                <li><CheckCircle2 size={14} color="#86efac" /> Full plan: direction, entry, stop, targets, confidence</li>
                                <li><CheckCircle2 size={14} color="#86efac" /> Live performance page anyone can audit</li>
                                <li><CheckCircle2 size={14} color="#86efac" /> Trust earned through transparent tracking</li>
                            </CompareList>
                        </CompareCard>
                    </CompareGrid>
                </Section>

                {/* ─── WHAT USERS DO ─── */}
                <Section $delay="0.35s">
                    <SectionHead>
                        <Eyebrow><Sparkles size={11} /> Your Loop</Eyebrow>
                        <SectionTitle>What you actually do on the platform</SectionTitle>
                        <SectionLead>
                            We build the signals, but the trader is still you. Here's the day-to-day.
                        </SectionLead>
                    </SectionHead>

                    <ActionGrid>
                        <ActionCard>
                            <div className="icon"><Eye size={20} /></div>
                            <div className="name">Review the setup</div>
                            <div className="desc">Open a signal — see entry, SL, targets, confidence, and the reasoning.</div>
                        </ActionCard>
                        <ActionCard>
                            <div className="icon"><Star size={20} /></div>
                            <div className="name">Follow the signal</div>
                            <div className="desc">Tap follow to track it. Notifications fire on TP/SL hits.</div>
                        </ActionCard>
                        <ActionCard>
                            <div className="icon"><FlaskConical size={20} /></div>
                            <div className="name">Paper or live trade</div>
                            <div className="desc">Test it with paper trading first, then graduate to your own broker.</div>
                        </ActionCard>
                        <ActionCard>
                            <div className="icon"><Bell size={20} /></div>
                            <div className="name">Set alerts</div>
                            <div className="desc">Custom alerts for price levels, breakouts, or signal triggers.</div>
                        </ActionCard>
                        <ActionCard>
                            <div className="icon"><BarChart3 size={20} /></div>
                            <div className="name">Track the result</div>
                            <div className="desc">Outcome shows up in your portfolio analytics + global stats page.</div>
                        </ActionCard>
                    </ActionGrid>
                </Section>

                {/* ─── FINAL CTA ─── */}
                <Section $delay="0.4s">
                    <CTAPanel>
                        <CTATitle>Now you know how it works.</CTATitle>
                        <CTASub>
                            Try the system for free. Every signal you see is the same one any other
                            user sees, scored the same way, tracked the same way.
                        </CTASub>
                        <CTAButtons>
                            <CTAPrimary onClick={() => navigate('/pricing')}>
                                <Sparkles size={16} /> Start Free Trial <ArrowRight size={14} />
                            </CTAPrimary>
                            <CTASecondary onClick={() => navigate('/signals')}>
                                <Eye size={16} /> View Live Signals <ChevronRight size={14} />
                            </CTASecondary>
                        </CTAButtons>
                    </CTAPanel>
                </Section>
            </Container>
        </Page>
    );
};

export default HowItWorksPage;
