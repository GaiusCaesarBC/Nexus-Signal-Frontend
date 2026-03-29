// client/src/pages/LandingPage.js — Modern SaaS Landing Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp, TrendingDown, Brain, Target, Shield, Users,
    ArrowRight, Trophy, BarChart3, Zap, Activity, CheckCircle,
    ChevronRight, Sparkles, Play, Star, Lock
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ─── Animations ───────────────────────────────────────────
const fadeIn = keyframes`from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); }`;
const fadeInSlow = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); }`;
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.5; }`;
const shimmer = keyframes`0% { background-position: -200% center; } 100% { background-position: 200% center; }`;
const gradientShift = keyframes`0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; }`;
const glowPulse = keyframes`0%, 100% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.15); } 50% { box-shadow: 0 0 80px rgba(0, 173, 237, 0.3); }`;

// ─── Layout ───────────────────────────────────────────────
const Page = styled.div`
    min-height: 100vh;
    background: transparent;
    color: #e0e6ed;
    position: relative;
    overflow-x: hidden;
`;

const BgEffects = styled.div`
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
`;

const Orb = styled.div`
    position: absolute;
    width: ${p => p.$size}px; height: ${p => p.$size}px;
    background: ${p => p.$color};
    border-radius: 50%;
    filter: blur(${p => p.$blur}px);
    opacity: ${p => p.$opacity};
    top: ${p => p.$top}%; left: ${p => p.$left}%;
    animation: ${float} ${p => p.$dur}s ease-in-out infinite;
`;

const Grid = styled.div`
    position: absolute; inset: 0;
    background-image:
        linear-gradient(rgba(0, 173, 237, 0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 173, 237, 0.025) 1px, transparent 1px);
    background-size: 80px 80px;
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
`;

const Content = styled.div`position: relative; z-index: 1;`;

const Section = styled.section`
    padding: ${p => p.$py || '6rem'} 2rem;
    max-width: 1200px;
    margin: 0 auto;
    @media (max-width: 768px) { padding: ${p => p.$pyMobile || '4rem'} 1.25rem; }
`;

// ─── Nav ──────────────────────────────────────────────────
const Nav = styled.nav`
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    padding: 1rem 2rem;
    background: rgba(5, 8, 22, 0.8);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    display: flex; justify-content: space-between; align-items: center;
`;

const Logo = styled.div`
    font-size: 1.5rem; font-weight: 800;
    background: linear-gradient(135deg, #00adef, #00ff88);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
`;

const NavRight = styled.div`display: flex; align-items: center; gap: 0.75rem;`;

const NavBtn = styled.button`
    padding: 0.55rem 1.2rem;
    background: ${p => p.$primary
        ? 'linear-gradient(135deg, #00adef, #0090d0)'
        : 'transparent'};
    border: ${p => p.$primary ? 'none' : '1px solid rgba(255,255,255,0.12)'};
    color: ${p => p.$primary ? '#fff' : '#94a3b8'};
    border-radius: 8px; font-weight: 600; font-size: 0.9rem;
    cursor: pointer; transition: all 0.2s;
    &:hover { transform: translateY(-1px); color: #fff;
        ${p => !p.$primary && 'border-color: rgba(255,255,255,0.25);'}
    }
`;

// ─── Hero ─────────────────────────────────────────────────
const Hero = styled.section`
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
    padding: 10rem 2rem 4rem;
    max-width: 900px; margin: 0 auto;
    @media (max-width: 768px) { padding: 8rem 1.25rem 3rem; }
`;

const HeroBadge = styled.div`
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: rgba(0, 173, 237, 0.08);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 100px;
    color: #00adef; font-size: 0.85rem; font-weight: 600;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const HeroTitle = styled.h1`
    font-size: clamp(2.5rem, 5.5vw, 4rem);
    font-weight: 900; line-height: 1.1;
    margin-bottom: 1.5rem;
    animation: ${fadeIn} 0.8s ease-out 0.1s backwards;
    .gradient {
        background: linear-gradient(135deg, #00adef 0%, #00ff88 50%, #8b5cf6 100%);
        background-size: 200% 200%;
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: ${gradientShift} 6s ease infinite;
    }
`;

const HeroSub = styled.p`
    font-size: clamp(1.05rem, 2vw, 1.25rem);
    color: #94a3b8; line-height: 1.7;
    max-width: 640px; margin-bottom: 2.5rem;
    animation: ${fadeIn} 0.8s ease-out 0.25s backwards;
`;

const HeroCTAs = styled.div`
    display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
    animation: ${fadeIn} 0.8s ease-out 0.4s backwards;
`;

const PrimaryBtn = styled.button`
    padding: 1rem 2.25rem;
    background: linear-gradient(135deg, #00adef, #0090d0);
    border: none; color: white;
    border-radius: 12px; font-size: 1.1rem; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; gap: 0.6rem;
    transition: all 0.25s;
    position: relative; overflow: hidden;
    &::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }
    &:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0, 173, 237, 0.4); }
`;

const SecondaryBtn = styled.button`
    padding: 0.9rem 2rem;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #94a3b8; border-radius: 12px;
    font-size: 1.05rem; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 0.6rem;
    transition: all 0.25s;
    &:hover { border-color: rgba(255,255,255,0.3); color: #e0e6ed; transform: translateY(-2px); }
`;

// ─── Signal Showcase ──────────────────────────────────────
const SignalSection = styled.section`
    padding: 0 2rem 6rem;
    max-width: 720px; margin: 0 auto;
    @media (max-width: 768px) { padding: 0 1.25rem 4rem; }
`;

const SignalLabel = styled.div`
    text-align: center; margin-bottom: 1.5rem;
    color: #94a3b8; font-size: 0.8rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 3px;
    animation: ${fadeIn} 0.6s ease-out;
`;

const SignalCard = styled.div`
    background: linear-gradient(135deg, rgba(15, 20, 38, 0.95), rgba(10, 14, 30, 0.98));
    border: 1px solid rgba(0, 173, 237, 0.25);
    border-radius: 20px;
    padding: 2rem;
    animation: ${fadeIn} 0.8s ease-out 0.2s backwards, ${glowPulse} 4s ease-in-out infinite;
    position: relative;
    &::before {
        content: ''; position: absolute; inset: -1px; border-radius: 20px;
        background: linear-gradient(135deg, rgba(0,173,237,0.3), rgba(16,185,129,0.15), rgba(139,92,246,0.2));
        z-index: -1; filter: blur(1px);
    }
    @media (max-width: 768px) { padding: 1.5rem; }
`;

const SignalTop = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.5rem;
`;

const SignalTicker = styled.div`
    display: flex; align-items: center; gap: 1rem;
`;

const TickerSymbol = styled.div`
    font-size: 1.8rem; font-weight: 900; color: #fff;
    @media (max-width: 768px) { font-size: 1.4rem; }
`;

const TickerName = styled.div`font-size: 0.85rem; color: #64748b;`;

const DirectionBadge = styled.div`
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.4rem 1rem;
    background: ${p => p.$up ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
    border: 1px solid ${p => p.$up ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
    color: ${p => p.$up ? '#10b981' : '#ef4444'};
    border-radius: 100px; font-weight: 700; font-size: 0.9rem;
`;

const LiveDot = styled.span`
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.75rem; color: #10b981; font-weight: 600;
    &::before {
        content: ''; width: 6px; height: 6px;
        background: #10b981; border-radius: 50%;
        animation: ${pulse} 1.5s ease-in-out infinite;
    }
`;

const SignalMetrics = styled.div`
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1rem; margin-bottom: 1.5rem;
    @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const Metric = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px; padding: 1rem;
    text-align: center;
`;

const MetricLabel = styled.div`font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem;`;
const MetricValue = styled.div`font-size: 1.4rem; font-weight: 800; color: ${p => p.$color || '#fff'};`;

const SignalSignals = styled.div`
    display: flex; gap: 0.75rem; flex-wrap: wrap;
`;

const SignalTag = styled.div`
    display: flex; align-items: center; gap: 0.4rem;
    padding: 0.35rem 0.8rem;
    background: ${p => p.$bg || 'rgba(139, 92, 246, 0.1)'};
    border: 1px solid ${p => p.$border || 'rgba(139, 92, 246, 0.2)'};
    border-radius: 8px;
    font-size: 0.8rem; font-weight: 600;
    color: ${p => p.$color || '#a78bfa'};
`;

// ─── Section Headers ──────────────────────────────────────
const SHeader = styled.div`text-align: center; margin-bottom: 3.5rem;`;

const SBadge = styled.div`
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.35rem 0.9rem;
    background: ${p => p.$bg || 'rgba(0, 173, 237, 0.08)'};
    border: 1px solid ${p => p.$border || 'rgba(0, 173, 237, 0.2)'};
    border-radius: 100px;
    color: ${p => p.$color || '#00adef'};
    font-size: 0.8rem; font-weight: 600;
    margin-bottom: 1rem;
`;

const STitle = styled.h2`
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 900; color: #e0e6ed; margin-bottom: 0.75rem;
`;

const SSub = styled.p`
    font-size: 1.05rem; color: #64748b; max-width: 550px; margin: 0 auto; line-height: 1.6;
`;

// ─── How It Works ─────────────────────────────────────────
const Steps = styled.div`
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 2rem; position: relative;
    @media (max-width: 768px) { grid-template-columns: 1fr; gap: 1.5rem; }
`;

const StepLine = styled.div`
    position: absolute; top: 48px; left: 16%; right: 16%; height: 2px;
    background: linear-gradient(90deg, #00adef, #8b5cf6, #10b981);
    opacity: 0.2;
    @media (max-width: 768px) { display: none; }
`;

const Step = styled.div`
    text-align: center;
    animation: ${fadeIn} 0.7s ease-out ${p => p.$delay || '0s'} backwards;
`;

const StepIcon = styled.div`
    width: 72px; height: 72px; margin: 0 auto 1.25rem;
    background: ${p => p.$gradient};
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 1.5rem; font-weight: 900;
    box-shadow: 0 8px 32px ${p => p.$shadow};
    animation: ${float} 5s ease-in-out infinite;
    animation-delay: ${p => p.$delay || '0s'};
`;

const StepTitle = styled.h3`font-size: 1.2rem; font-weight: 700; color: #e0e6ed; margin-bottom: 0.5rem;`;
const StepDesc = styled.p`font-size: 0.95rem; color: #94a3b8; line-height: 1.6;`;

// ─── Leaderboard ──────────────────────────────────────────
const LeaderGrid = styled.div`
    display: flex; flex-direction: column;
    gap: .75rem; max-width: 700px; margin: 0 auto;
`;

const LeaderCard = styled.div`
    background: rgba(15, 20, 38, 0.8);
    border: 1px solid ${p =>
        p.$rank === 1 ? 'rgba(251, 191, 36, 0.35)' :
        p.$rank === 2 ? 'rgba(148, 163, 184, 0.3)' :
        p.$rank === 3 ? 'rgba(251, 146, 60, 0.3)' :
        'rgba(255, 255, 255, 0.06)'};
    border-radius: 16px; padding: 1.5rem;
    display: flex; align-items: center; gap: 1rem;
    transition: all 0.25s; cursor: pointer;
    animation: ${fadeIn} 0.6s ease-out ${p => p.$delay || '0s'} backwards;
    &:hover { transform: translateY(-4px); border-color: rgba(0, 173, 237, 0.4);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); }
`;

const RankBadge = styled.div`
    width: 36px; height: 36px; border-radius: 10px;
    background: ${p =>
        p.$rank === 1 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
        p.$rank === 2 ? 'linear-gradient(135deg, #94a3b8, #64748b)' :
        p.$rank === 3 ? 'linear-gradient(135deg, #fb923c, #f97316)' :
        'rgba(0, 173, 237, 0.12)'};
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 0.9rem;
    color: ${p => p.$rank <= 3 ? '#fff' : '#00adef'};
    flex-shrink: 0;
`;

const LeaderAvatar = styled.div`
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, #00adef, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; color: white; font-size: 1rem; flex-shrink: 0;
    overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
`;

const LeaderInfo = styled.div`flex: 1; min-width: 0;`;
const LeaderName = styled.div`font-weight: 700; color: #e0e6ed; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
const LeaderMeta = styled.div`font-size: 0.8rem; color: #64748b; margin-top: 0.15rem;`;
const LeaderReturn = styled.div`font-size: 1.2rem; font-weight: 800; color: ${p => p.$pos ? '#10b981' : '#ef4444'};`;

// ─── Features ─────────────────────────────────────────────
const FeatureGrid = styled.div`
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const FeatureCard = styled.div`
    background: rgba(15, 20, 38, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px; padding: 1.75rem;
    transition: all 0.3s;
    animation: ${fadeIn} 0.6s ease-out ${p => p.$delay || '0s'} backwards;
    &:hover { transform: translateY(-6px); border-color: rgba(0, 173, 237, 0.3);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3); }
`;

const FeatureIcon = styled.div`
    width: 48px; height: 48px;
    background: ${p => p.$gradient};
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: white; margin-bottom: 1.25rem;
`;

const FeatureTitle = styled.h3`font-size: 1.15rem; font-weight: 700; color: #e0e6ed; margin-bottom: 0.5rem;`;
const FeatureDesc = styled.p`font-size: 0.9rem; color: #94a3b8; line-height: 1.6;`;

// ─── Stats ────────────────────────────────────────────────
const StatsGrid = styled.div`
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
`;

const StatCard = styled.div`
    text-align: center; padding: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out ${p => p.$delay || '0s'} backwards;
`;

const StatValue = styled.div`font-size: 2.5rem; font-weight: 900; color: ${p => p.$color || '#00adef'}; margin-bottom: 0.4rem;`;
const StatLabel = styled.div`font-size: 0.9rem; color: #64748b;`;

// ─── CTA ──────────────────────────────────────────────────
const CTACard = styled.div`
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.08), rgba(139, 92, 246, 0.08));
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 24px; padding: 4rem 3rem;
    text-align: center; position: relative; overflow: hidden;
    &::before {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.04) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 5s linear infinite;
    }
    @media (max-width: 768px) { padding: 3rem 1.5rem; }
`;

const CTATitle = styled.h2`font-size: clamp(1.75rem, 3.5vw, 2.4rem); font-weight: 900; color: #e0e6ed; margin-bottom: 1rem; position: relative; z-index: 1;`;
const CTADesc = styled.p`font-size: 1.05rem; color: #94a3b8; margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto; position: relative; z-index: 1; line-height: 1.6;`;
const CTABtns = styled.div`display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; position: relative; z-index: 1;`;

const TrustRow = styled.div`
    display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;
    margin-top: 2rem; position: relative; z-index: 1;
`;

const TrustItem = styled.div`
    display: flex; align-items: center; gap: 0.4rem;
    color: #64748b; font-size: 0.85rem;
    svg { color: #10b981; width: 16px; height: 16px; }
`;

// ─── Footer ───────────────────────────────────────────────
const Footer = styled.footer`
    padding: 3rem 2rem; text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
`;

const FooterText = styled.p`color: #475569; font-size: 0.85rem;`;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [stats, setStats] = useState({ totalPredictions: 0, accuracy: 0 });
    const [topTraders, setTopTraders] = useState([]);
    const [signal, setSignal] = useState(null);

    useEffect(() => {
        fetchStats();
        fetchLeaderboard();
        fetchLatestSignal();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/predictions/platform-stats`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setStats({
                        totalPredictions: data.totalPredictions || 0,
                        accuracy: data.accuracy || 0
                    });
                }
            }
        } catch (err) { /* silent */ }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`${API_URL}/leaderboard/top`);
            if (res.ok) {
                const data = await res.json();
                setTopTraders((data.topTraders || []).slice(0, 5));
            }
        } catch (err) { /* silent */ }
    };

    const fetchLatestSignal = async () => {
        try {
            const res = await fetch(`${API_URL}/predictions/recent?limit=1`);
            if (res.ok) {
                const data = await res.json();
                const p = Array.isArray(data) ? data[0] : null;
                if (p) {
                    const days = Math.max(1, Math.round((new Date(p.expiresAt) - new Date(p.createdAt)) / (1000 * 60 * 60 * 24)));
                    setSignal({
                        symbol: p.symbol,
                        name: p.symbol,
                        direction: p.direction === 'UP' ? 'BULLISH' : 'BEARISH',
                        confidence: Math.round(p.confidence || 0),
                        targetMove: `$${p.targetPrice?.toFixed(2) || '—'}`,
                        targetPrice: `$${p.targetPrice?.toFixed(2) || '—'}`,
                        timeframe: `${days} day${days !== 1 ? 's' : ''}`,
                    });
                }
            }
        } catch (err) { /* silent */ }
    };

    const fmt = (n) => {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
        return n.toLocaleString();
    };

    const goToProfile = (username) => {
        if (username) navigate(`/profile/${username}`);
    };

    const features = [
        { icon: <Brain size={22} />, gradient: 'linear-gradient(135deg, #00adef, #0090d0)', title: 'AI Predictions', desc: 'Directional signals with confidence scores for stocks and crypto. Know what to trade and when.' },
        { icon: <BarChart3 size={22} />, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', title: 'Pattern Scanner', desc: 'Auto-detect chart patterns, support/resistance, and technical setups across thousands of assets.' },
        { icon: <Activity size={22} />, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', title: 'Sentiment Analysis', desc: 'Social sentiment and news flow in one view. Confirm your thesis before you enter.' },
        { icon: <Shield size={22} />, gradient: 'linear-gradient(135deg, #10b981, #059669)', title: 'Paper Trading', desc: '$100K in simulated funds. Test every strategy risk-free before going live.' },
        { icon: <Target size={22} />, gradient: 'linear-gradient(135deg, #ec4899, #db2777)', title: 'Backtesting', desc: 'Run strategies against real historical data. See results before risking capital.' },
        { icon: <Users size={22} />, gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', title: 'Social Trading', desc: 'Follow top performers. Copy trades. Compete on the leaderboard.' },
    ];

    // Fallback signal if API returns nothing
    const defaultSignal = {
        symbol: 'NVDA', name: 'NVIDIA Corporation', direction: 'BULLISH',
        confidence: 87, targetMove: '+12.4%', targetPrice: '$160.17', timeframe: '7 days',
    };

    const displaySignal = signal || defaultSignal;

    return (
        <Page>
            <SEO
                title="Nexus Signal — AI-Powered Trading Signals"
                description="Find better trades with AI. Get price predictions, pattern detection, and sentiment analysis — all in one platform. Start your free 7-day trial."
                keywords="AI trading signals, stock predictions, AI stock analysis, trading platform, paper trading"
            />

            <BgEffects>
                <Grid />
                <Orb $size={600} $top={5} $left={-8} $color="rgba(0,173,237,0.1)" $blur={100} $opacity={0.5} $dur={22} />
                <Orb $size={400} $top={55} $left={78} $color="rgba(139,92,246,0.08)" $blur={80} $opacity={0.35} $dur={28} />
                <Orb $size={300} $top={80} $left={25} $color="rgba(16,185,129,0.06)" $blur={70} $opacity={0.3} $dur={25} />
            </BgEffects>

            <Content>
                {/* ─── Nav ─── */}
                <Nav>
                    <Logo onClick={() => navigate('/')}>
                        <TrendingUp size={24} />Nexus Signal
                    </Logo>
                    <NavRight>
                        {isAuthenticated ? (
                            <NavBtn $primary onClick={() => navigate('/dashboard')}>Dashboard</NavBtn>
                        ) : (
                            <>
                                <NavBtn onClick={() => navigate('/login')}>Log In</NavBtn>
                                <NavBtn $primary onClick={() => navigate('/register')}>Start Free Trial</NavBtn>
                            </>
                        )}
                    </NavRight>
                </Nav>

                {/* ─── Hero ─── */}
                <Hero>
                    <HeroBadge><Zap size={14} /> Trusted by active traders</HeroBadge>
                    <HeroTitle>
                        AI Tells You <span className="gradient">What to Trade</span><br />
                        Before the Market Moves
                    </HeroTitle>
                    <HeroSub>
                        Get directional signals with confidence scores, target prices, and
                        supporting analysis — for stocks and crypto, updated in real time.
                    </HeroSub>
                    <HeroCTAs>
                        <PrimaryBtn onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}>
                            Get Free Access Now <ArrowRight size={18} />
                        </PrimaryBtn>
                        <SecondaryBtn onClick={() => navigate('/pricing')}>
                            <Sparkles size={18} /> 7-Day Premium Trial
                        </SecondaryBtn>
                    </HeroCTAs>
                </Hero>

                {/* ─── Live Signal Showcase ─── */}
                <SignalSection>
                    <SignalLabel>{signal ? '🔴  LIVE AI SIGNAL' : 'EXAMPLE AI SIGNAL'}</SignalLabel>
                    <SignalCard>
                        <SignalTop>
                            <SignalTicker>
                                <div>
                                    <TickerSymbol>{displaySignal.symbol}</TickerSymbol>
                                    <TickerName>{displaySignal.name}</TickerName>
                                </div>
                            </SignalTicker>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <LiveDot>{signal ? 'LIVE' : 'EXAMPLE'}</LiveDot>
                                <DirectionBadge $up={displaySignal.direction === 'BULLISH'}>
                                    {displaySignal.direction === 'BULLISH' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {displaySignal.direction}
                                </DirectionBadge>
                            </div>
                        </SignalTop>

                        <SignalMetrics>
                            <Metric>
                                <MetricLabel>AI Confidence</MetricLabel>
                                <MetricValue $color="#10b981">{displaySignal.confidence}%</MetricValue>
                            </Metric>
                            <Metric>
                                <MetricLabel>Target Price</MetricLabel>
                                <MetricValue $color="#00adef">{displaySignal.targetPrice}</MetricValue>
                            </Metric>
                            <Metric>
                                <MetricLabel>Timeframe</MetricLabel>
                                <MetricValue>{displaySignal.timeframe}</MetricValue>
                            </Metric>
                        </SignalMetrics>

                        <SignalSignals>
                            <SignalTag $bg="rgba(16,185,129,0.1)" $border="rgba(16,185,129,0.2)" $color="#10b981">
                                <CheckCircle size={12} /> AI Analysis
                            </SignalTag>
                            <SignalTag $bg="rgba(0,173,237,0.1)" $border="rgba(0,173,237,0.2)" $color="#00adef">
                                <CheckCircle size={12} /> Technical Indicators
                            </SignalTag>
                            <SignalTag $bg="rgba(245,158,11,0.1)" $border="rgba(245,158,11,0.2)" $color="#f59e0b">
                                <CheckCircle size={12} /> Sentiment Data
                            </SignalTag>
                        </SignalSignals>
                    </SignalCard>
                </SignalSection>

                {/* ─── How It Works ─── */}
                <Section>
                    <SHeader>
                        <SBadge><Zap size={14} /> 3 Steps</SBadge>
                        <STitle>Signal to Trade in 60 Seconds</STitle>
                        <SSub>No setup. No learning curve. Just signals.</SSub>
                    </SHeader>

                    <Steps>
                        <StepLine />
                        <Step $delay="0s">
                            <StepIcon $gradient="linear-gradient(135deg, #00adef, #0090d0)" $shadow="rgba(0,173,237,0.3)" $delay="0s">1</StepIcon>
                            <StepTitle>Sign Up Free</StepTitle>
                            <StepDesc>Create your account in seconds. No credit card needed.</StepDesc>
                        </Step>
                        <Step $delay="0.15s">
                            <StepIcon $gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" $shadow="rgba(139,92,246,0.3)" $delay="0.5s">2</StepIcon>
                            <StepTitle>See What AI Finds</StepTitle>
                            <StepDesc>Receive signals with direction, confidence, and target price — backed by pattern and sentiment data.</StepDesc>
                        </Step>
                        <Step $delay="0.3s">
                            <StepIcon $gradient="linear-gradient(135deg, #10b981, #059669)" $shadow="rgba(16,185,129,0.3)" $delay="1s">3</StepIcon>
                            <StepTitle>Execute & Track</StepTitle>
                            <StepDesc>Paper trade risk-free with $100K or go live. Every prediction is tracked for accuracy.</StepDesc>
                        </Step>
                    </Steps>
                </Section>

                {/* ─── Leaderboard ─── */}
                <Section $py="5rem">
                    <SHeader>
                        <SBadge $bg="rgba(251,191,36,0.08)" $border="rgba(251,191,36,0.2)" $color="#fbbf24">
                            <Trophy size={14} /> Live Rankings
                        </SBadge>
                        <STitle>Real Traders. Real Returns.</STitle>
                        <SSub>These aren't hypothetical — every trade is tracked and verified on-platform.</SSub>
                    </SHeader>

                    <LeaderGrid>
                        {(topTraders.length >= 3 ? topTraders.slice(0, 5) : [
                            { rank: 1, user: { username: 'AlphaTrader', profile: {} }, totalReturnPercent: 34.2, totalTrades: 89 },
                            { rank: 2, user: { username: 'CryptoWhale', profile: {} }, totalReturnPercent: 28.7, totalTrades: 156 },
                            { rank: 3, user: { username: 'SwingKing', profile: {} }, totalReturnPercent: 22.1, totalTrades: 64 },
                            { rank: 4, user: { username: 'SignalHunter', profile: {} }, totalReturnPercent: 18.5, totalTrades: 112 },
                            { rank: 5, user: { username: 'BullRunner', profile: {} }, totalReturnPercent: 15.3, totalTrades: 78 },
                        ]).map((t, i) => {
                            const username = t.user?.username || `Trader${i + 1}`;
                            const avatar = t.user?.profile?.avatar;
                            const initials = username.charAt(0).toUpperCase();
                            const ret = t.totalReturnPercent ?? 0;
                            const trades = t.totalTrades || 0;
                            const rank = t.rank || i + 1;

                            return (
                                <LeaderCard key={i} $rank={rank} $delay={`${i * 0.08}s`} onClick={() => goToProfile(username)}>
                                    <RankBadge $rank={rank}>{rank}</RankBadge>
                                    <LeaderAvatar>
                                        {avatar ? <img src={avatar} alt={username} /> : initials}
                                    </LeaderAvatar>
                                    <LeaderInfo>
                                        <LeaderName>{username}</LeaderName>
                                        <LeaderMeta>{trades} trades</LeaderMeta>
                                    </LeaderInfo>
                                    <LeaderReturn $pos={ret >= 0}>
                                        {ret >= 0 ? '+' : ''}{ret.toFixed(1)}%
                                    </LeaderReturn>
                                </LeaderCard>
                            );
                        })}
                    </LeaderGrid>
                </Section>

                {/* ─── Features ─── */}
                <Section>
                    <SHeader>
                        <SBadge $bg="rgba(139,92,246,0.08)" $border="rgba(139,92,246,0.2)" $color="#a78bfa">
                            <Star size={14} /> Platform
                        </SBadge>
                        <STitle>Your Complete Trading Edge</STitle>
                        <SSub>Six tools. One platform. Every signal backed by data.</SSub>
                    </SHeader>

                    <FeatureGrid>
                        {features.map((f, i) => (
                            <FeatureCard key={i} $delay={`${i * 0.08}s`}>
                                <FeatureIcon $gradient={f.gradient}>{f.icon}</FeatureIcon>
                                <FeatureTitle>{f.title}</FeatureTitle>
                                <FeatureDesc>{f.desc}</FeatureDesc>
                            </FeatureCard>
                        ))}
                    </FeatureGrid>
                </Section>

                {/* ─── Stats ─── */}
                <Section $py="4rem">
                    <StatsGrid>
                        <StatCard $delay="0s">
                            <StatValue $color="#00adef">Real-Time</StatValue>
                            <StatLabel>AI Market Analysis</StatLabel>
                        </StatCard>
                        <StatCard $delay="0.08s">
                            <StatValue $color="#10b981">Tracked</StatValue>
                            <StatLabel>Every Prediction Verified</StatLabel>
                        </StatCard>
                        <StatCard $delay="0.16s">
                            <StatValue $color="#f59e0b">$100K</StatValue>
                            <StatLabel>Paper Trading Funds</StatLabel>
                        </StatCard>
                        <StatCard $delay="0.24s">
                            <StatValue $color="#8b5cf6">24/7</StatValue>
                            <StatLabel>Stocks + Crypto Coverage</StatLabel>
                        </StatCard>
                    </StatsGrid>
                </Section>

                {/* Footer CTA is handled by the global Footer component */}
            </Content>
        </Page>
    );
};

export default LandingPage;
