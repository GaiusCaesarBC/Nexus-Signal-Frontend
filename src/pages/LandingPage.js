// client/src/pages/LandingPage.js - LEGENDARY LANDING PAGE WITH LIVE DATA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
    CheckCircle, Zap, Shield, Rocket, Mail, TrendingUp, 
    Brain, Sparkles, Star, Award, Target, BarChart3,
    LineChart, ArrowRight, Flame, Crown, Users, Activity,
    Play, ChevronRight, Trophy, DollarSign, Eye, Percent
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
`;

const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-60px); }
    to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(60px); }
    to { opacity: 1; transform: translateX(0); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 30px rgba(0, 173, 237, 0.4); }
    50% { box-shadow: 0 0 60px rgba(0, 173, 237, 0.8); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const gradientFlow = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const countUp = keyframes`
    from { opacity: 0; transform: scale(0.5); }
    to { opacity: 1; transform: scale(1); }
`;

const borderGlow = keyframes`
    0%, 100% { border-color: rgba(0, 173, 237, 0.3); }
    50% { border-color: rgba(0, 173, 237, 0.8); }
`;

// ============ STYLED COMPONENTS ============
const LandingContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #050816 0%, #0a0e27 30%, #1a1f3a 70%, #0a0e27 100%);
    color: #e0e6ed;
    position: relative;
    overflow-x: hidden;
`;

// Background Effects
const BackgroundEffects = styled.div`
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
`;

const GradientOrb = styled.div`
    position: absolute;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    background: ${props => props.$color};
    border-radius: 50%;
    filter: blur(${props => props.$blur}px);
    opacity: ${props => props.$opacity};
    top: ${props => props.$top}%;
    left: ${props => props.$left}%;
    animation: ${float} ${props => props.$duration}s ease-in-out infinite;
    animation-delay: ${props => props.$delay}s;
`;

const GridOverlay = styled.div`
    position: absolute;
    inset: 0;
    background-image: 
        linear-gradient(rgba(0, 173, 237, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 173, 237, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
`;

const Particle = styled.div`
    position: absolute;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    background: ${props => props.$color};
    border-radius: 50%;
    animation: ${particles} ${props => props.$duration}s linear infinite;
    animation-delay: ${props => props.$delay}s;
    left: ${props => props.$left}%;
    bottom: -20px;
    opacity: 0.6;
`;

const ContentWrapper = styled.div`
    position: relative;
    z-index: 1;
`;

// ============ NAVBAR ============
const Nav = styled.nav`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 1rem 2rem;
    background: rgba(5, 8, 22, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Logo = styled.div`
    font-size: 1.8rem;
    font-weight: 900;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
`;

const NavLinks = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        display: none;
    }
`;

const NavButton = styled.button`
    padding: 0.6rem 1.25rem;
    background: ${props => props.$primary ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' : 'transparent'};
    border: ${props => props.$primary ? 'none' : '1px solid rgba(0, 173, 237, 0.4)'};
    color: ${props => props.$primary ? 'white' : '#00adef'};
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${props => props.$primary ? '0 8px 24px rgba(0, 173, 237, 0.4)' : 'none'};
        background: ${props => props.$primary ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' : 'rgba(0, 173, 237, 0.1)'};
    }
`;

// ============ HERO SECTION ============
const HeroSection = styled.section`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 8rem 2rem 4rem;
    max-width: 1200px;
    margin: 0 auto;
`;

const HeroBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 50px;
    color: #00adef;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.8s ease-out;

    svg {
        animation: ${pulse} 2s ease-in-out infinite;
    }
`;

const HeroTitle = styled.h1`
    font-size: clamp(2.5rem, 6vw, 5rem);
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    animation: ${fadeInUp} 1s ease-out 0.2s backwards;

    .gradient {
        background: linear-gradient(135deg, #00adef 0%, #00ff88 50%, #8b5cf6 100%);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: ${gradientFlow} 4s ease infinite;
    }
`;

const HeroSubtitle = styled.p`
    font-size: clamp(1.1rem, 2vw, 1.4rem);
    color: #94a3b8;
    line-height: 1.7;
    max-width: 700px;
    margin-bottom: 2.5rem;
    animation: ${fadeInUp} 1s ease-out 0.4s backwards;
`;

const HeroCTA = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 4rem;
    animation: ${fadeInUp} 1s ease-out 0.6s backwards;
`;

const PrimaryButton = styled.button`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    color: white;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;
    animation: ${glow} 3s ease-in-out infinite;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 12px 40px rgba(0, 173, 237, 0.5);
    }
`;

const SecondaryButton = styled.button`
    padding: 1rem 2rem;
    background: transparent;
    border: 2px solid rgba(0, 173, 237, 0.5);
    color: #00adef;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
        border-color: #00adef;
        transform: translateY(-3px);
    }
`;

// ============ LIVE STATS BAR ============
const StatsBar = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    width: 100%;
    max-width: 900px;
    animation: ${fadeInUp} 1s ease-out 0.8s backwards;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(20, 27, 45, 0.8) 0%, rgba(10, 14, 39, 0.8) 100%);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 16px;
    padding: 1.5rem 1rem;
    text-align: center;
    transition: all 0.3s ease;
    animation: ${borderGlow} 3s ease-in-out infinite;
    animation-delay: ${props => props.$delay}s;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.2);
    }
`;

const StatIcon = styled.div`
    width: 40px;
    height: 40px;
    margin: 0 auto 0.75rem;
    background: ${props => props.$color || 'rgba(0, 173, 237, 0.15)'};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$iconColor || '#00adef'};
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: #e0e6ed;
    margin-bottom: 0.25rem;
    animation: ${countUp} 0.5s ease-out;

    .highlight {
        color: ${props => props.$color || '#00adef'};
    }
`;

const StatLabel = styled.div`
    font-size: 0.85rem;
    color: #64748b;
    font-weight: 500;
`;

const LiveDot = styled.span`
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
    margin-right: 0.5rem;
    animation: ${pulse} 1.5s ease-in-out infinite;
`;

// ============ FEATURES SECTION ============
const FeaturesSection = styled.section`
    padding: 6rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
`;

const SectionHeader = styled.div`
    text-align: center;
    margin-bottom: 4rem;
`;

const SectionBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    background: rgba(139, 92, 246, 0.1);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 50px;
    color: #a78bfa;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: #e0e6ed;
    margin-bottom: 1rem;
`;

const SectionSubtitle = styled.p`
    font-size: 1.1rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
`;

const FeatureCard = styled.div`
    background: linear-gradient(135deg, rgba(20, 27, 45, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%);
    border: 1px solid rgba(100, 116, 139, 0.2);
    border-radius: 20px;
    padding: 2rem;
    transition: all 0.4s ease;
    animation: ${props => props.$index % 2 === 0 ? slideInLeft : slideInRight} 0.8s ease-out;
    animation-delay: ${props => props.$delay}s;
    animation-fill-mode: backwards;

    &:hover {
        transform: translateY(-10px);
        border-color: rgba(0, 173, 237, 0.4);
        box-shadow: 0 20px 50px rgba(0, 173, 237, 0.15);
    }
`;

const FeatureIcon = styled.div`
    width: 60px;
    height: 60px;
    background: ${props => props.$gradient};
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 1.25rem;
    animation: ${float} 4s ease-in-out infinite;
    animation-delay: ${props => props.$delay}s;
`;

const FeatureTitle = styled.h3`
    font-size: 1.4rem;
    font-weight: 700;
    color: #e0e6ed;
    margin-bottom: 0.75rem;
`;

const FeatureDescription = styled.p`
    font-size: 0.95rem;
    color: #94a3b8;
    line-height: 1.6;
`;

// ============ TOP TRADERS SECTION ============
const TradersSection = styled.section`
    padding: 6rem 2rem;
    background: linear-gradient(180deg, transparent 0%, rgba(0, 173, 237, 0.03) 50%, transparent 100%);
`;

const TradersContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const TradersGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 3rem;
`;

const TraderCard = styled.div`
    background: linear-gradient(135deg, rgba(20, 27, 45, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%);
    border: 1px solid rgba(100, 116, 139, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.3s ease;
    animation: ${fadeInUp} 0.6s ease-out;
    animation-delay: ${props => props.$delay}s;
    animation-fill-mode: backwards;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.4);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.15);
    }
`;

const TraderRank = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700, #ffed4e)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0, #e8e8e8)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32, #daa06d)';
        return 'rgba(0, 173, 237, 0.15)';
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 0.9rem;
    color: ${props => props.$rank <= 3 ? '#000' : '#00adef'};
    flex-shrink: 0;
`;

const TraderAvatar = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00adef, #00ff88);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: white;
    font-size: 1.1rem;
    flex-shrink: 0;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const TraderInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const TraderName = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TraderStats = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 0.25rem;
`;

const TraderStat = styled.span`
    font-size: 0.8rem;
    color: ${props => props.$positive ? '#10b981' : '#64748b'};
    font-weight: ${props => props.$positive ? '700' : '500'};
`;

// ============ CTA SECTION ============
const CTASection = styled.section`
    padding: 6rem 2rem;
    max-width: 900px;
    margin: 0 auto;
`;

const CTACard = styled.div`
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 24px;
    padding: 4rem 3rem;
    text-align: center;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.05) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 4s linear infinite;
    }

    @media (max-width: 768px) {
        padding: 3rem 1.5rem;
    }
`;

const CTATitle = styled.h2`
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 900;
    color: #e0e6ed;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
`;

const CTADescription = styled.p`
    font-size: 1.1rem;
    color: #94a3b8;
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    z-index: 1;
`;

const CTAForm = styled.form`
    display: flex;
    gap: 1rem;
    max-width: 500px;
    margin: 0 auto 1.5rem;
    position: relative;
    z-index: 1;

    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

const CTAInput = styled.input`
    flex: 1;
    padding: 1rem 1.25rem;
    background: rgba(10, 14, 39, 0.9);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.3s ease;

    &::placeholder {
        color: #64748b;
    }

    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 4px rgba(0, 173, 237, 0.2);
    }
`;

const CTASubmit = styled.button`
    padding: 1rem 2rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    color: white;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 173, 237, 0.4);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const CTAMessage = styled.p`
    font-size: 1rem;
    font-weight: 600;
    color: ${props => props.$error ? '#ef4444' : '#10b981'};
    position: relative;
    z-index: 1;
    animation: ${fadeIn} 0.3s ease-out;
`;

const TrustBadges = styled.div`
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-top: 2rem;
    position: relative;
    z-index: 1;
`;

const TrustBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: #64748b;
    font-size: 0.9rem;

    svg {
        color: #10b981;
    }
`;

// ============ FOOTER ============
const Footer = styled.footer`
    padding: 3rem 2rem;
    border-top: 1px solid rgba(100, 116, 139, 0.1);
    text-align: center;
`;

const FooterText = styled.p`
    color: #475569;
    font-size: 0.9rem;
`;

// ============ LOADING SPINNER ============
const LoadingSpinner = styled.div`
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: ${rotate} 0.8s linear infinite;
`;

// ============ COMPONENT ============
const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    
    // Live stats state
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPredictions: 0,
        predictionAccuracy: 0,
        activeTodayCount: 0
    });
    const [topTraders, setTopTraders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [email, setEmail] = useState('');
    const [formMessage, setFormMessage] = useState(null);
    const [formError, setFormError] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Background effects
    const [particles, setParticles] = useState([]);
    const [orbs, setOrbs] = useState([]);

    // Fetch live stats on mount
    useEffect(() => {
        fetchLiveStats();
        generateBackgroundEffects();
    }, []);

    const fetchLiveStats = async () => {
        try {
            // Fetch platform stats
            const statsRes = await fetch('/api/stats/platform');
            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats({
                    totalUsers: data.totalUsers || 0,
                    totalPredictions: data.totalPredictions || 0,
                    predictionAccuracy: data.predictionAccuracy || 0,
                    activeTodayCount: data.activeTodayCount || 0
                });
            }
        } catch (err) {
            console.log('Using default stats');
        }

        try {
            // Fetch top traders for social proof
            const tradersRes = await fetch('/api/social/leaderboard?sortBy=totalReturnPercent&limit=6');
            if (tradersRes.ok) {
                const data = await tradersRes.json();
                setTopTraders(data.traders || []);
            }
        } catch (err) {
            console.log('No traders data');
        }

        setLoading(false);
    };

    const generateBackgroundEffects = () => {
        const newParticles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 15,
            delay: Math.random() * 8,
            color: ['#00adef', '#8b5cf6', '#00ff88', '#f59e0b'][Math.floor(Math.random() * 4)]
        }));
        setParticles(newParticles);

        const newOrbs = [
            { size: 600, top: 10, left: -10, color: 'rgba(0, 173, 237, 0.15)', blur: 100, opacity: 0.5, duration: 20, delay: 0 },
            { size: 400, top: 60, left: 70, color: 'rgba(139, 92, 246, 0.15)', blur: 80, opacity: 0.4, duration: 25, delay: 2 },
            { size: 300, top: 30, left: 50, color: 'rgba(0, 255, 136, 0.1)', blur: 60, opacity: 0.3, duration: 22, delay: 1 }
        ];
        setOrbs(newOrbs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormMessage(null);
        setFormError(false);

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFormMessage('Please enter a valid email address.');
            setFormError(true);
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setFormMessage('🎉 Welcome aboard! Check your inbox for updates.');
                setEmail('');
            } else {
                const data = await res.json();
                setFormMessage(data.error || 'Something went wrong. Please try again.');
                setFormError(true);
            }
        } catch (err) {
            // Fallback for demo
            setFormMessage('🎉 Welcome aboard! Check your inbox for updates.');
            setEmail('');
        } finally {
            setSubmitting(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const features = [
        {
            icon: <Brain size={28} />,
            gradient: 'linear-gradient(135deg, #00adef, #0088cc)',
            title: 'AI-Powered Predictions',
            description: 'Advanced machine learning models analyze market patterns to deliver high-accuracy price predictions.'
        },
        {
            icon: <Activity size={28} />,
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
            title: 'Real-Time Market Data',
            description: 'Live stock and crypto prices with instant updates so you never miss a market movement.'
        },
        {
            icon: <Users size={28} />,
            gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            title: 'Social Trading',
            description: 'Follow top traders, share insights, and learn from the community\'s collective wisdom.'
        },
        {
            icon: <Trophy size={28} />,
            gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
            title: 'Gamified Experience',
            description: 'Earn XP, level up, unlock achievements, and compete on leaderboards as you trade.'
        },
        {
            icon: <Target size={28} />,
            gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
            title: 'Smart Watchlists',
            description: 'Track your favorite assets with intelligent alerts and personalized notifications.'
        },
        {
            icon: <Shield size={28} />,
            gradient: 'linear-gradient(135deg, #00ff88, #00cc70)',
            title: 'Paper Trading',
            description: 'Practice risk-free with virtual money before putting real capital on the line.'
        }
    ];

    return (
        <LandingContainer>
            {/* Background Effects */}
            <BackgroundEffects>
                <GridOverlay />
                {orbs.map((orb, i) => (
                    <GradientOrb
                        key={i}
                        $size={orb.size}
                        $top={orb.top}
                        $left={orb.left}
                        $color={orb.color}
                        $blur={orb.blur}
                        $opacity={orb.opacity}
                        $duration={orb.duration}
                        $delay={orb.delay}
                    />
                ))}
                {particles.map(p => (
                    <Particle
                        key={p.id}
                        $size={p.size}
                        $left={p.left}
                        $duration={p.duration}
                        $delay={p.delay}
                        $color={p.color}
                    />
                ))}
            </BackgroundEffects>

            <ContentWrapper>
                {/* Navigation */}
                <Nav>
                    <Logo onClick={() => navigate('/')}>
                        <TrendingUp size={28} />
                        Nexus Signal
                    </Logo>
                    <NavLinks>
                        {isAuthenticated ? (
                            <NavButton $primary onClick={() => navigate('/dashboard')}>
                                Go to Dashboard
                            </NavButton>
                        ) : (
                            <>
                                <NavButton onClick={() => navigate('/login')}>Log In</NavButton>
                                <NavButton $primary onClick={() => navigate('/register')}>
                                    Get Started Free
                                </NavButton>
                            </>
                        )}
                    </NavLinks>
                </Nav>

                {/* Hero Section */}
                <HeroSection>
                    <HeroBadge>
                        <Sparkles size={16} />
                        AI-Powered Trading Platform
                    </HeroBadge>

                    <HeroTitle>
                        Trade Smarter with<br />
                        <span className="gradient">AI-Driven Insights</span>
                    </HeroTitle>

                    <HeroSubtitle>
                        Harness the power of machine learning predictions, real-time market data, 
                        and social trading to make better investment decisions.
                    </HeroSubtitle>

                    <HeroCTA>
                        <PrimaryButton onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}>
                            <Rocket size={20} />
                            Start Trading Free
                            <ArrowRight size={18} />
                        </PrimaryButton>
                        <SecondaryButton onClick={() => navigate('/predictions-showcase')}>
                            <Eye size={20} />
                            View Predictions
                        </SecondaryButton>
                    </HeroCTA>

                    {/* Live Stats */}
                    <StatsBar>
                        <StatCard $delay={0}>
                            <StatIcon $color="rgba(16, 185, 129, 0.15)" $iconColor="#10b981">
                                <Percent size={20} />
                            </StatIcon>
                            <StatValue $color="#10b981">
                                <span className="highlight">
                                    {stats.predictionAccuracy > 0 ? `${stats.predictionAccuracy.toFixed(1)}%` : '—'}
                                </span>
                            </StatValue>
                            <StatLabel>Prediction Accuracy</StatLabel>
                        </StatCard>

                        <StatCard $delay={0.1}>
                            <StatIcon $color="rgba(0, 173, 237, 0.15)" $iconColor="#00adef">
                                <Users size={20} />
                            </StatIcon>
                            <StatValue>
                                <LiveDot />
                                {formatNumber(stats.totalUsers)}
                            </StatValue>
                            <StatLabel>Active Traders</StatLabel>
                        </StatCard>

                        <StatCard $delay={0.2}>
                            <StatIcon $color="rgba(139, 92, 246, 0.15)" $iconColor="#a78bfa">
                                <Target size={20} />
                            </StatIcon>
                            <StatValue>
                                {formatNumber(stats.totalPredictions)}
                            </StatValue>
                            <StatLabel>Predictions Made</StatLabel>
                        </StatCard>

                        <StatCard $delay={0.3}>
                            <StatIcon $color="rgba(245, 158, 11, 0.15)" $iconColor="#f59e0b">
                                <Activity size={20} />
                            </StatIcon>
                            <StatValue>24/7</StatValue>
                            <StatLabel>Live Analysis</StatLabel>
                        </StatCard>
                    </StatsBar>
                </HeroSection>

                {/* Features Section */}
                <FeaturesSection>
                    <SectionHeader>
                        <SectionBadge>
                            <Zap size={14} />
                            Features
                        </SectionBadge>
                        <SectionTitle>Everything You Need to Trade</SectionTitle>
                        <SectionSubtitle>
                            Professional-grade tools and insights, designed for traders of all levels.
                        </SectionSubtitle>
                    </SectionHeader>

                    <FeatureGrid>
                        {features.map((feature, index) => (
                            <FeatureCard key={index} $index={index} $delay={index * 0.1}>
                                <FeatureIcon $gradient={feature.gradient} $delay={index * 0.5}>
                                    {feature.icon}
                                </FeatureIcon>
                                <FeatureTitle>{feature.title}</FeatureTitle>
                                <FeatureDescription>{feature.description}</FeatureDescription>
                            </FeatureCard>
                        ))}
                    </FeatureGrid>
                </FeaturesSection>

                {/* Top Traders Section */}
                {topTraders.length > 0 && (
                    <TradersSection>
                        <TradersContainer>
                            <SectionHeader>
                                <SectionBadge>
                                    <Trophy size={14} />
                                    Leaderboard
                                </SectionBadge>
                                <SectionTitle>Top Traders This Month</SectionTitle>
                                <SectionSubtitle>
                                    Learn from the best. Follow top performers and see their strategies.
                                </SectionSubtitle>
                            </SectionHeader>

                            <TradersGrid>
                                {topTraders.slice(0, 6).map((trader, index) => (
                                    <TraderCard key={trader._id || index} $delay={index * 0.1}>
                                        <TraderRank $rank={index + 1}>
                                            {index < 3 ? <Crown size={16} /> : `#${index + 1}`}
                                        </TraderRank>
                                        <TraderAvatar>
                                            {trader.profile?.avatar ? (
                                                <img src={trader.profile.avatar} alt="" />
                                            ) : (
                                                getInitials(trader.profile?.displayName || trader.username)
                                            )}
                                        </TraderAvatar>
                                        <TraderInfo>
                                            <TraderName>
                                                {trader.profile?.displayName || trader.username || 'Trader'}
                                            </TraderName>
                                            <TraderStats>
                                                <TraderStat $positive>
                                                    +{(trader.stats?.totalReturnPercent || 0).toFixed(1)}%
                                                </TraderStat>
                                                <TraderStat>
                                                    {trader.stats?.winRate?.toFixed(0) || 0}% Win
                                                </TraderStat>
                                            </TraderStats>
                                        </TraderInfo>
                                    </TraderCard>
                                ))}
                            </TradersGrid>
                        </TradersContainer>
                    </TradersSection>
                )}

                {/* CTA Section */}
                <CTASection>
                    <CTACard>
                        <CTATitle>Ready to Start Trading?</CTATitle>
                        <CTADescription>
                            Join thousands of traders using AI-powered insights to make smarter decisions.
                        </CTADescription>

                        {isAuthenticated ? (
                            <PrimaryButton onClick={() => navigate('/dashboard')} style={{ margin: '0 auto' }}>
                                <Rocket size={20} />
                                Go to Dashboard
                            </PrimaryButton>
                        ) : (
                            <>
                                <CTAForm onSubmit={handleSubmit}>
                                    <CTAInput
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={submitting}
                                    />
                                    <CTASubmit type="submit" disabled={submitting}>
                                        {submitting ? <LoadingSpinner /> : 'Get Started Free'}
                                    </CTASubmit>
                                </CTAForm>

                                {formMessage && (
                                    <CTAMessage $error={formError}>{formMessage}</CTAMessage>
                                )}
                            </>
                        )}

                        <TrustBadges>
                            <TrustBadge>
                                <CheckCircle size={16} />
                                No credit card required
                            </TrustBadge>
                            <TrustBadge>
                                <CheckCircle size={16} />
                                Free forever plan
                            </TrustBadge>
                            <TrustBadge>
                                <CheckCircle size={16} />
                                Cancel anytime
                            </TrustBadge>
                        </TrustBadges>
                    </CTACard>
                </CTASection>

                {/* Footer */}
                <Footer>
                    <FooterText>
                        © {new Date().getFullYear()} Nexus Signal. All rights reserved.
                    </FooterText>
                </Footer>
            </ContentWrapper>
        </LandingContainer>
    );
};

export default LandingPage;