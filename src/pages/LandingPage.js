// client/src/pages/LandingPage.js - LIVE DATA VERSION
// All mock data replaced with real API endpoints

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    CheckCircle, Zap, Shield, Rocket, TrendingUp, TrendingDown,
    Brain, Sparkles, Target, BarChart3, ArrowRight, Flame, Crown,
    Users, Activity, Trophy, DollarSign, MessageSquare, Coins, Send, Cloud,
    UserPlus, LineChart, Gift, Play, Monitor, Smartphone, Bell, Star,
    ChevronRight, Award, Lock, Layers, Eye, TrendingUp as Chart
} from 'lucide-react';
import SEO from '../components/SEO';

// API URL for production - same pattern as AboutPage
const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ============ ANIMATIONS ============
const fadeIn = keyframes`from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); }`;
const fadeInUp = keyframes`from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); }`;
const slideInLeft = keyframes`from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); }`;
const slideInRight = keyframes`from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); }`;
const float = keyframes`0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); }`;
const pulse = keyframes`0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.9; }`;
const glow = keyframes`0%, 100% { box-shadow: 0 0 30px rgba(0, 173, 237, 0.4); } 50% { box-shadow: 0 0 60px rgba(0, 173, 237, 0.8); }`;
const shimmer = keyframes`0% { background-position: -200% center; } 100% { background-position: 200% center; }`;
const scrollTicker = keyframes`0% { transform: translateX(0); } 100% { transform: translateX(-50%); }`;
const gradientFlow = keyframes`0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; }`;
const borderGlow = keyframes`0%, 100% { border-color: rgba(0, 173, 237, 0.3); } 50% { border-color: rgba(0, 173, 237, 0.8); }`;
const slideUp = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;

// ============ STYLED COMPONENTS ============
const LandingContainer = styled.div`min-height: 100vh; background: transparent; color: ${({ theme }) => theme.text?.primary || '#e0e6ed'}; position: relative; overflow-x: hidden; z-index: 1;`;
const BackgroundEffects = styled.div`position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;`;
const GradientOrb = styled.div`position: absolute; width: ${p => p.$size}px; height: ${p => p.$size}px; background: ${p => p.$color}; border-radius: 50%; filter: blur(${p => p.$blur}px); opacity: ${p => p.$opacity}; top: ${p => p.$top}%; left: ${p => p.$left}%; animation: ${float} ${p => p.$duration}s ease-in-out infinite; animation-delay: ${p => p.$delay}s;`;
const GridOverlay = styled.div`position: absolute; inset: 0; background-image: linear-gradient(rgba(0, 173, 237, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 173, 237, 0.03) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);`;
const ContentWrapper = styled.div`position: relative; z-index: 1;`;

const Nav = styled.nav`position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1rem 2rem; background: rgba(5, 8, 22, 0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(0, 173, 237, 0.1); display: flex; justify-content: space-between; align-items: center;`;
const Logo = styled.div`font-size: 1.8rem; font-weight: 900; background: linear-gradient(135deg, #00adef 0%, #00ff88 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; display: flex; align-items: center; gap: 0.5rem; cursor: pointer;`;
const NavLinks = styled.div`display: flex; align-items: center; gap: 1rem; @media (max-width: 768px) { gap: 0.5rem; }`;
const NavButton = styled.button`padding: 0.6rem 1.25rem; background: ${p => p.$primary ? 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)' : 'transparent'}; border: ${p => p.$primary ? 'none' : '1px solid rgba(0, 173, 237, 0.4)'}; color: ${p => p.$primary ? 'white' : '#00adef'}; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: all 0.3s ease; &:hover { transform: translateY(-2px); } @media (max-width: 768px) { padding: 0.5rem 1rem; font-size: 0.85rem; }`;

const AnnouncementBanner = styled.div`margin-top: 64px; padding: 3rem 2rem; background: linear-gradient(135deg, rgba(0, 173, 237, 0.08) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(236, 72, 153, 0.08) 100%); border-bottom: 1px solid rgba(139, 92, 246, 0.2);`;
const AnnouncementContent = styled.div`max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: 3rem; flex-wrap: wrap; @media (max-width: 900px) { gap: 1.5rem; }`;
const AnnouncementHighlight = styled.div`display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background: rgba(10, 14, 39, 0.6); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px; transition: all 0.3s ease; animation: ${fadeIn} 0.8s ease-out; animation-delay: ${p => p.$delay || '0s'}; animation-fill-mode: backwards; &:hover { transform: translateY(-4px); border-color: rgba(139, 92, 246, 0.6); } @media (max-width: 600px) { padding: 0.75rem 1rem; }`;
const HighlightIcon = styled.div`width: 50px; height: 50px; border-radius: 14px; background: ${p => p.$gradient || 'linear-gradient(135deg, #00adef, #0088cc)'}; display: flex; align-items: center; justify-content: center; color: white; animation: ${float} 3s ease-in-out infinite; @media (max-width: 600px) { width: 40px; height: 40px; }`;
const HighlightText = styled.div``;
const HighlightValue = styled.div`font-size: 1.5rem; font-weight: 900; color: ${p => p.$color || '#e0e6ed'}; line-height: 1.2; @media (max-width: 600px) { font-size: 1.2rem; }`;
const HighlightLabel = styled.div`font-size: 0.8rem; color: #64748b; font-weight: 500;`;
const LaunchBadge = styled.div`display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1.25rem 2rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(0, 173, 237, 0.15) 100%); border: 2px solid rgba(16, 185, 129, 0.4); border-radius: 20px; animation: ${pulse} 3s ease-in-out infinite;`;
const LaunchLabel = styled.div`font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #10b981;`;
const LaunchDate = styled.div`font-size: 1.4rem; font-weight: 900; background: linear-gradient(135deg, #10b981 0%, #00adef 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`;
const LaunchSubtext = styled.div`font-size: 0.75rem; color: #64748b;`;

const TickerWrapper = styled.div`background: rgba(0, 173, 237, 0.05); border-bottom: 1px solid rgba(0, 173, 237, 0.15); padding: 0.6rem 0; overflow: hidden;`;
const TickerTrack = styled.div`display: flex; animation: ${scrollTicker} 40s linear infinite; white-space: nowrap;`;
const TickerItem = styled.div`display: inline-flex; align-items: center; gap: 0.5rem; margin: 0 2rem; font-size: 0.9rem;`;
const TickerSymbol = styled.span`color: ${p => p.$crypto ? '#f7931a' : '#00adef'}; font-weight: 700;`;
const TickerPrice = styled.span`color: #e0e6ed; font-weight: 600;`;
const TickerChange = styled.span`color: ${p => p.$positive ? '#10b981' : '#ef4444'}; display: flex; align-items: center; gap: 0.25rem; font-weight: 600; font-size: 0.85rem;`;

const ShowcaseSection = styled.div`padding: 2.5rem 2rem; background: linear-gradient(180deg, rgba(10, 14, 39, 0.5) 0%, transparent 100%);`;
const ShowcaseContainer = styled.div`max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; @media (max-width: 900px) { grid-template-columns: 1fr; gap: 1rem; }`;
const ShowcaseCard = styled.div`background: linear-gradient(135deg, rgba(20, 27, 45, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%); border: 1px solid ${p => p.$borderColor || 'rgba(0, 173, 237, 0.2)'}; border-radius: 16px; padding: 1.25rem; animation: ${fadeIn} 0.6s ease-out; animation-delay: ${p => p.$delay || '0s'}; animation-fill-mode: backwards;`;
const ShowcaseHeader = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;`;
const ShowcaseTitle = styled.h4`font-size: 0.9rem; color: ${p => p.$color || '#00adef'}; display: flex; align-items: center; gap: 0.5rem; font-weight: 700;`;
const ShowcaseBadge = styled.span`font-size: 0.7rem; padding: 0.2rem 0.5rem; background: rgba(16, 185, 129, 0.2); color: #10b981; border-radius: 10px; font-weight: 600; display: flex; align-items: center; gap: 0.3rem;`;

const WinnerItem = styled.div`display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem; background: rgba(16, 185, 129, 0.05); border-radius: 10px; margin-bottom: 0.5rem; &:last-child { margin-bottom: 0; }`;
const WinnerAvatar = styled.div`width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #00adef); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;`;
const WinnerInfo = styled.div`flex: 1; min-width: 0;`;
const WinnerName = styled.div`font-size: 0.85rem; color: #e0e6ed; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
const WinnerTrade = styled.div`font-size: 0.75rem; color: #64748b;`;
const WinnerProfit = styled.div`font-size: 0.95rem; font-weight: 800; color: #10b981;`;

const HotStock = styled.div`display: flex; align-items: center; justify-content: space-between; padding: 0.6rem; background: rgba(251, 191, 36, 0.05); border-radius: 10px; margin-bottom: 0.5rem; &:last-child { margin-bottom: 0; }`;
const HotStockSymbol = styled.div`font-size: 1rem; font-weight: 800; color: #fbbf24;`;
const HotStockName = styled.div`font-size: 0.75rem; color: #64748b;`;
const HotStockChange = styled.div`font-size: 1rem; font-weight: 800; color: ${p => p.$positive ? '#10b981' : '#ef4444'};`;

const QuickStat = styled.div`display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(139, 92, 246, 0.05); border-radius: 10px; margin-bottom: 0.5rem; &:last-child { margin-bottom: 0; }`;
const QuickStatIcon = styled.div`width: 40px; height: 40px; border-radius: 10px; background: ${p => p.$bg || 'rgba(139, 92, 246, 0.15)'}; display: flex; align-items: center; justify-content: center; color: ${p => p.$color || '#a78bfa'};`;
const QuickStatInfo = styled.div`flex: 1;`;
const QuickStatValue = styled.div`font-size: 1.25rem; font-weight: 900; color: #e0e6ed;`;
const QuickStatLabel = styled.div`font-size: 0.75rem; color: #64748b;`;

const HeroSection = styled.section`display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 3rem 2rem 4rem; max-width: 1200px; margin: 0 auto;`;
const HeroBadge = styled.div`display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(0, 173, 237, 0.1); border: 1px solid rgba(0, 173, 237, 0.3); border-radius: 50px; color: #00adef; font-size: 0.9rem; font-weight: 600; margin-bottom: 2rem; animation: ${fadeIn} 0.8s ease-out; svg { animation: ${pulse} 2s ease-in-out infinite; }`;
const HeroTitle = styled.h1`font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; animation: ${fadeInUp} 1s ease-out 0.2s backwards; .gradient { background: linear-gradient(135deg, #00adef 0%, #00ff88 50%, #8b5cf6 100%); background-size: 200% 200%; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: ${gradientFlow} 4s ease infinite; }`;
const HeroSubtitle = styled.p`font-size: clamp(1.1rem, 2vw, 1.35rem); color: #94a3b8; line-height: 1.7; max-width: 700px; margin-bottom: 2.5rem; animation: ${fadeInUp} 1s ease-out 0.4s backwards;`;
const HeroCTA = styled.div`display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-bottom: 4rem; animation: ${fadeInUp} 1s ease-out 0.6s backwards;`;
const PrimaryButton = styled.button`padding: 1rem 2rem; background: linear-gradient(135deg, #00adef 0%, #0088cc 100%); border: none; color: white; border-radius: 12px; font-size: 1.1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; transition: all 0.3s ease; animation: ${glow} 3s ease-in-out infinite; position: relative; overflow: hidden; &::before { content: ''; position: absolute; inset: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%); background-size: 200% 200%; animation: ${shimmer} 3s linear infinite; } &:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 40px rgba(0, 173, 237, 0.5); }`;
const SecondaryButton = styled.button`padding: 1rem 2rem; background: transparent; border: 2px solid rgba(0, 173, 237, 0.5); color: #00adef; border-radius: 12px; font-size: 1.1rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; transition: all 0.3s ease; &:hover { background: rgba(0, 173, 237, 0.1); border-color: #00adef; transform: translateY(-3px); }`;

const LiveDot = styled.span`display: inline-block; width: 8px; height: 8px; background: #10b981; border-radius: 50%; animation: ${pulse} 1.5s ease-in-out infinite;`;

const ActivitySection = styled.section`padding: 5rem 2rem; background: linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.03) 50%, transparent 100%);`;
const ActivityContainer = styled.div`max-width: 1200px; margin: 0 auto;`;
const SectionHeader = styled.div`text-align: center; margin-bottom: 3rem;`;
const SectionBadge = styled.div`display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem; background: ${p => p.$bg || 'rgba(139, 92, 246, 0.1)'}; border: 1px solid ${p => p.$border || 'rgba(139, 92, 246, 0.3)'}; border-radius: 50px; color: ${p => p.$color || '#a78bfa'}; font-size: 0.85rem; font-weight: 600; margin-bottom: 1rem;`;
const SectionTitle = styled.h2`font-size: clamp(1.8rem, 4vw, 2.75rem); font-weight: 900; color: #e0e6ed; margin-bottom: 0.75rem;`;
const SectionSubtitle = styled.p`font-size: 1.05rem; color: #64748b; max-width: 600px; margin: 0 auto;`;

const ActivityGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; @media (max-width: 900px) { grid-template-columns: 1fr; }`;
const ActivityFeed = styled.div`background: linear-gradient(135deg, rgba(20, 27, 45, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 20px; padding: 1.5rem; max-height: 400px; overflow-y: auto;`;
const ActivityTitle = styled.h3`font-size: 1.1rem; color: #a78bfa; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;`;
const ActivityItem = styled.div`display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: rgba(139, 92, 246, 0.05); border-radius: 10px; margin-bottom: 0.5rem; animation: ${slideUp} 0.4s ease-out; animation-delay: ${p => p.$delay}s; animation-fill-mode: backwards;`;
const ActivityIcon = styled.div`width: 36px; height: 36px; border-radius: 10px; background: ${p => p.$bg || 'rgba(0, 173, 237, 0.15)'}; display: flex; align-items: center; justify-content: center; color: ${p => p.$color || '#00adef'}; flex-shrink: 0;`;
const ActivityContent = styled.div`flex: 1; min-width: 0;`;
const ActivityText = styled.div`font-size: 0.9rem; color: #e0e6ed; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; strong { color: #00adef; }`;
const ActivityTime = styled.div`font-size: 0.75rem; color: #64748b;`;

const PredictionsFeed = styled(ActivityFeed)`border-color: rgba(16, 185, 129, 0.2);`;
const PredictionItem = styled.div`display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.1); border-radius: 12px; margin-bottom: 0.75rem; transition: all 0.2s ease; &:hover { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); }`;
const PredictionSymbol = styled.div`font-size: 1.1rem; font-weight: 800; color: #00adef; min-width: 70px;`;
const PredictionDirection = styled.div`display: flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.75rem; background: ${p => p.$up ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; border-radius: 20px; color: ${p => p.$up ? '#10b981' : '#ef4444'}; font-weight: 700; font-size: 0.8rem;`;
const PredictionInfo = styled.div`flex: 1;`;
const PredictionTarget = styled.div`font-size: 0.85rem; color: #94a3b8;`;
const PredictionConfidence = styled.div`font-size: 0.9rem; font-weight: 700; color: #10b981;`;

const TradersSection = styled.section`padding: 5rem 2rem;`;
const TradersContainer = styled.div`max-width: 1200px; margin: 0 auto;`;
const TradersGrid = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2.5rem; @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 600px) { grid-template-columns: 1fr; }`;
const TraderCard = styled.div`background: linear-gradient(135deg, rgba(20, 27, 45, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%); border: 1px solid ${p => { if (p.$rank === 1) return 'rgba(251, 191, 36, 0.4)'; if (p.$rank === 2) return 'rgba(148, 163, 184, 0.4)'; if (p.$rank === 3) return 'rgba(251, 146, 60, 0.4)'; return 'rgba(100, 116, 139, 0.2)'; }}; border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; transition: all 0.3s ease; cursor: pointer; animation: ${fadeInUp} 0.6s ease-out; animation-delay: ${p => p.$delay}s; animation-fill-mode: backwards; &:hover { transform: translateY(-5px); border-color: rgba(0, 173, 237, 0.5); box-shadow: 0 10px 30px rgba(0, 173, 237, 0.15); }`;
const TraderRank = styled.div`width: 40px; height: 40px; border-radius: 12px; background: ${p => { if (p.$rank === 1) return 'linear-gradient(135deg, #fbbf24, #f59e0b)'; if (p.$rank === 2) return 'linear-gradient(135deg, #94a3b8, #64748b)'; if (p.$rank === 3) return 'linear-gradient(135deg, #fb923c, #f97316)'; return 'rgba(0, 173, 237, 0.15)'; }}; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1rem; color: ${p => p.$rank <= 3 ? 'white' : '#00adef'}; flex-shrink: 0;`;
const TraderAvatar = styled.div`width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, #00adef, #8b5cf6); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 1.2rem; flex-shrink: 0; overflow: hidden; border: 2px solid ${p => { if (p.$rank === 1) return '#fbbf24'; if (p.$rank === 2) return '#94a3b8'; if (p.$rank === 3) return '#fb923c'; return 'transparent'; }}; img { width: 100%; height: 100%; object-fit: cover; }`;
const TraderInfo = styled.div`flex: 1; min-width: 0;`;
const TraderName = styled.div`font-weight: 700; color: #e0e6ed; font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 0.5rem;`;
const VerifiedBadge = styled.span`color: #00adef; display: flex;`;
const TraderMeta = styled.div`display: flex; gap: 1rem; margin-top: 0.3rem;`;
const TraderStat = styled.span`font-size: 0.8rem; color: ${p => p.$highlight ? '#10b981' : '#64748b'}; font-weight: ${p => p.$highlight ? '700' : '500'};`;
const TraderReturn = styled.div`font-size: 1.3rem; font-weight: 900; color: ${p => p.$positive ? '#10b981' : '#ef4444'};`;

const FeaturesSection = styled.section`padding: 5rem 2rem; background: linear-gradient(180deg, transparent 0%, rgba(0, 173, 237, 0.03) 50%, transparent 100%);`;
const FeaturesContainer = styled.div`max-width: 1200px; margin: 0 auto;`;
const FeatureGrid = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 2.5rem; @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 600px) { grid-template-columns: 1fr; }`;
const FeatureCard = styled.div`background: linear-gradient(135deg, rgba(20, 27, 45, 0.9) 0%, rgba(10, 14, 39, 0.9) 100%); border: 1px solid rgba(100, 116, 139, 0.2); border-radius: 20px; padding: 2rem; transition: all 0.4s ease; animation: ${p => p.$index % 2 === 0 ? slideInLeft : slideInRight} 0.8s ease-out; animation-delay: ${p => p.$delay}s; animation-fill-mode: backwards; &:hover { transform: translateY(-8px); border-color: rgba(0, 173, 237, 0.4); box-shadow: 0 20px 50px rgba(0, 173, 237, 0.15); }`;
const FeatureIcon = styled.div`width: 56px; height: 56px; background: ${p => p.$gradient}; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 1.25rem; animation: ${float} 4s ease-in-out infinite; animation-delay: ${p => p.$delay}s;`;
const FeatureTitle = styled.h3`font-size: 1.3rem; font-weight: 700; color: #e0e6ed; margin-bottom: 0.75rem;`;
const FeatureDescription = styled.p`font-size: 0.95rem; color: #94a3b8; line-height: 1.6;`;

const SocialProofSection = styled.section`padding: 4rem 2rem;`;
const SocialProofContainer = styled.div`max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }`;
const ProofCard = styled.div`text-align: center; padding: 1.5rem;`;
const ProofValue = styled.div`font-size: 2.5rem; font-weight: 900; color: ${p => p.$color || '#00adef'}; margin-bottom: 0.5rem;`;
const ProofLabel = styled.div`font-size: 0.9rem; color: #64748b;`;

const CTASection = styled.section`padding: 5rem 2rem;`;
const CTACard = styled.div`max-width: 900px; margin: 0 auto; background: linear-gradient(135deg, rgba(0, 173, 237, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 2px solid rgba(0, 173, 237, 0.3); border-radius: 24px; padding: 4rem 3rem; text-align: center; position: relative; overflow: hidden; &::before { content: ''; position: absolute; inset: 0; background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.05) 50%, transparent 70%); background-size: 200% 200%; animation: ${shimmer} 4s linear infinite; } @media (max-width: 768px) { padding: 3rem 1.5rem; }`;
const CTATitle = styled.h2`font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 900; color: #e0e6ed; margin-bottom: 1rem; position: relative; z-index: 1;`;
const CTADescription = styled.p`font-size: 1.1rem; color: #94a3b8; margin-bottom: 2rem; max-width: 550px; margin-left: auto; margin-right: auto; position: relative; z-index: 1;`;
const TrustBadges = styled.div`display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-top: 2rem; position: relative; z-index: 1;`;
const TrustBadge = styled.div`display: flex; align-items: center; gap: 0.4rem; color: #64748b; font-size: 0.9rem; svg { color: #10b981; }`;

const PoweredBySection = styled.section`padding: 3rem 2rem; background: linear-gradient(180deg, transparent 0%, rgba(0, 173, 237, 0.02) 100%);`;
const PoweredByContainer = styled.div`max-width: 1000px; margin: 0 auto; text-align: center;`;
const PoweredByTitle = styled.div`font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.5rem; font-weight: 600;`;
const PoweredByGrid = styled.div`display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 1rem 2rem; @media (max-width: 768px) { gap: 0.75rem 1.25rem; }`;
const PoweredByItem = styled.a`display: flex; align-items: center; gap: 0.5rem; color: #94a3b8; text-decoration: none; font-size: 0.85rem; font-weight: 500; padding: 0.5rem 0.75rem; border-radius: 8px; transition: all 0.3s ease; opacity: 0.7; &:hover { opacity: 1; color: #e0e6ed; background: rgba(0, 173, 237, 0.1); transform: translateY(-2px); }`;

const Footer = styled.footer`padding: 3rem 2rem; border-top: 1px solid rgba(100, 116, 139, 0.1); text-align: center;`;
const FooterText = styled.p`color: #475569; font-size: 0.9rem;`;

// ============ HOW IT WORKS SECTION ============
const drawLine = keyframes`from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; }`;
const countUp = keyframes`from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); }`;

const HowItWorksSection = styled.section`padding: 6rem 2rem; background: linear-gradient(180deg, rgba(0, 173, 237, 0.02) 0%, rgba(139, 92, 246, 0.03) 50%, transparent 100%); position: relative; overflow: hidden;`;
const HowItWorksContainer = styled.div`max-width: 1200px; margin: 0 auto;`;
const StepsContainer = styled.div`display: flex; justify-content: center; align-items: flex-start; gap: 2rem; margin-top: 4rem; position: relative; @media (max-width: 900px) { flex-direction: column; align-items: center; gap: 3rem; }`;
const StepConnector = styled.div`position: absolute; top: 60px; left: 50%; transform: translateX(-50%); width: 60%; height: 3px; background: linear-gradient(90deg, #00adef 0%, #8b5cf6 50%, #10b981 100%); opacity: 0.3; @media (max-width: 900px) { display: none; }`;
const StepCard = styled.div`flex: 1; max-width: 320px; text-align: center; position: relative; animation: ${fadeInUp} 0.8s ease-out; animation-delay: ${p => p.$delay || '0s'}; animation-fill-mode: backwards;`;
const StepNumber = styled.div`width: 80px; height: 80px; margin: 0 auto 1.5rem; background: ${p => p.$gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; color: white; box-shadow: 0 10px 40px ${p => p.$shadow || 'rgba(0, 173, 237, 0.4)'}; position: relative; animation: ${float} 4s ease-in-out infinite; animation-delay: ${p => p.$floatDelay || '0s'}; &::after { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid ${p => p.$borderColor || 'rgba(0, 173, 237, 0.3)'}; animation: ${pulse} 2s ease-in-out infinite; }`;
const StepIconWrap = styled.div`position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`;
const StepTitle = styled.h3`font-size: 1.4rem; font-weight: 800; color: #e0e6ed; margin-bottom: 0.75rem;`;
const StepDescription = styled.p`font-size: 1rem; color: #94a3b8; line-height: 1.6;`;
const StepBadge = styled.div`display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; background: ${p => p.$bg || 'rgba(0, 173, 237, 0.1)'}; border: 1px solid ${p => p.$border || 'rgba(0, 173, 237, 0.3)'}; border-radius: 20px; font-size: 0.75rem; font-weight: 600; color: ${p => p.$color || '#00adef'}; margin-top: 1rem;`;

// ============ FEATURE DEMOS SECTION ============
const chartPulse = keyframes`0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); }`;
const scanLine = keyframes`0% { top: 0; } 100% { top: 100%; }`;
const typewriter = keyframes`from { width: 0; } to { width: 100%; }`;

const DemoSection = styled.section`padding: 6rem 2rem; position: relative;`;
const DemoContainer = styled.div`max-width: 1400px; margin: 0 auto;`;
const DemoGrid = styled.div`display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-top: 3rem; @media (max-width: 1000px) { grid-template-columns: 1fr; }`;
const DemoCard = styled.div`background: linear-gradient(135deg, rgba(15, 20, 40, 0.95) 0%, rgba(10, 14, 30, 0.98) 100%); border: 1px solid ${p => p.$borderColor || 'rgba(0, 173, 237, 0.2)'}; border-radius: 24px; overflow: hidden; transition: all 0.4s ease; animation: ${fadeIn} 0.8s ease-out; animation-delay: ${p => p.$delay || '0s'}; animation-fill-mode: backwards; &:hover { transform: translateY(-8px); border-color: ${p => p.$hoverBorder || 'rgba(0, 173, 237, 0.5)'}; box-shadow: 0 20px 60px ${p => p.$shadow || 'rgba(0, 173, 237, 0.2)'}; }`;
const DemoHeader = styled.div`padding: 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: space-between;`;
const DemoTitleGroup = styled.div`display: flex; align-items: center; gap: 0.75rem;`;
const DemoIconWrap = styled.div`width: 44px; height: 44px; background: ${p => p.$gradient || 'linear-gradient(135deg, #00adef, #0088cc)'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;`;
const DemoTitle = styled.h4`font-size: 1.1rem; font-weight: 700; color: #e0e6ed;`;
const DemoSubtitle = styled.p`font-size: 0.8rem; color: #64748b;`;
const DemoBadge = styled.span`padding: 0.3rem 0.6rem; background: ${p => p.$bg || 'rgba(16, 185, 129, 0.15)'}; color: ${p => p.$color || '#10b981'}; border-radius: 6px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;`;
const DemoPreview = styled.div`padding: 2rem; min-height: 280px; position: relative; overflow: hidden; background: radial-gradient(ellipse at bottom, rgba(0, 173, 237, 0.05) 0%, transparent 70%);`;

// AI Prediction Demo Styles
const PredictionDemoWrap = styled.div`display: flex; flex-direction: column; gap: 1rem;`;
const MiniChart = styled.div`height: 120px; display: flex; align-items: flex-end; gap: 3px; padding: 1rem; background: rgba(0, 0, 0, 0.2); border-radius: 12px; position: relative; overflow: hidden;`;
const ChartBar = styled.div`flex: 1; background: ${p => p.$up ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)'}; border-radius: 2px 2px 0 0; height: ${p => p.$height}%; animation: ${chartPulse} ${p => p.$duration || '2s'} ease-in-out infinite; animation-delay: ${p => p.$delay || '0s'}; opacity: 0.8;`;
const PredictionOverlay = styled.div`position: absolute; top: 1rem; right: 1rem; padding: 0.6rem 1rem; background: rgba(16, 185, 129, 0.9); border-radius: 8px; color: white; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.4rem; animation: ${pulse} 2s ease-in-out infinite;`;
const AnalysisRow = styled.div`display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px; border-left: 3px solid ${p => p.$color || '#00adef'};`;
const AnalysisLabel = styled.span`font-size: 0.85rem; color: #94a3b8;`;
const AnalysisValue = styled.span`font-size: 0.85rem; font-weight: 700; color: ${p => p.$color || '#e0e6ed'};`;

// Paper Trading Demo Styles
const TradingDemoWrap = styled.div``;
const TradingHeader = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;`;
const TradingSymbol = styled.div`font-size: 1.5rem; font-weight: 900; color: #00adef;`;
const TradingPrice = styled.div`font-size: 1.25rem; font-weight: 700; color: #e0e6ed; span { font-size: 0.9rem; color: #10b981; margin-left: 0.5rem; }`;
const TradingActions = styled.div`display: flex; gap: 0.75rem; margin-top: 1rem;`;
const TradingButton = styled.div`flex: 1; padding: 0.75rem; text-align: center; border-radius: 10px; font-weight: 700; font-size: 0.9rem; background: ${p => p.$buy ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'}; color: white; cursor: default;`;
const PortfolioPreview = styled.div`margin-top: 1.25rem; padding: 1rem; background: rgba(0, 0, 0, 0.2); border-radius: 12px;`;
const PortfolioRow = styled.div`display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); &:last-child { border-bottom: none; }`;
const PortfolioLabel = styled.span`font-size: 0.85rem; color: #64748b;`;
const PortfolioValue = styled.span`font-size: 0.9rem; font-weight: 600; color: ${p => p.$color || '#e0e6ed'};`;

// Social Demo Styles
const SocialDemoWrap = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`;
const SocialPost = styled.div`padding: 1rem; background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05); animation: ${slideUp} 0.5s ease-out; animation-delay: ${p => p.$delay || '0s'}; animation-fill-mode: backwards;`;
const SocialHeader = styled.div`display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;`;
const SocialAvatar = styled.div`width: 36px; height: 36px; border-radius: 50%; background: ${p => p.$bg || 'linear-gradient(135deg, #00adef, #8b5cf6)'}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.85rem;`;
const SocialName = styled.span`font-weight: 600; color: #e0e6ed; font-size: 0.9rem;`;
const SocialTime = styled.span`font-size: 0.75rem; color: #64748b; margin-left: auto;`;
const SocialContent = styled.p`font-size: 0.85rem; color: #94a3b8; line-height: 1.5;`;
const SocialStats = styled.div`display: flex; gap: 1rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.05);`;
const SocialStat = styled.span`font-size: 0.75rem; color: #64748b; display: flex; align-items: center; gap: 0.3rem;`;

// Gamification Demo Styles
const GamificationDemoWrap = styled.div``;
const XPBar = styled.div`height: 24px; background: rgba(0, 0, 0, 0.3); border-radius: 12px; overflow: hidden; position: relative; margin-bottom: 1rem;`;
const XPFill = styled.div`height: 100%; width: ${p => p.$percent || '0%'}; background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%); border-radius: 12px; transition: width 1s ease-out; position: relative; &::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%); }`;
const XPText = styled.div`position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.75rem; font-weight: 700; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5);`;
const LevelBadge = styled.div`display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 123, 250, 0.1)); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 20px; margin-bottom: 1rem;`;
const LevelNumber = styled.span`font-size: 1.25rem; font-weight: 900; color: #a78bfa;`;
const LevelText = styled.span`font-size: 0.85rem; color: #94a3b8;`;
const AchievementGrid = styled.div`display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-top: 1rem;`;
const AchievementBadge = styled.div`aspect-ratio: 1; background: ${p => p.$unlocked ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1))' : 'rgba(0, 0, 0, 0.2)'}; border: 1px solid ${p => p.$unlocked ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255, 255, 255, 0.05)'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: ${p => p.$unlocked ? '#fbbf24' : '#475569'}; transition: all 0.3s ease; &:hover { transform: scale(1.1); }`;

// ============ ENHANCED HERO MOCKUP ============
const floatSlow = keyframes`0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(2deg); }`;
const floatFast = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); }`;
const glowPulse = keyframes`0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.3), 0 0 40px rgba(0, 173, 237, 0.1); } 50% { box-shadow: 0 0 30px rgba(0, 173, 237, 0.5), 0 0 60px rgba(0, 173, 237, 0.2); }`;
const slideInNotif = keyframes`from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); }`;
const countUpPulse = keyframes`0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); }`;

const HeroWithMockup = styled.div`display: flex; align-items: center; justify-content: center; gap: 4rem; max-width: 1400px; margin: 0 auto; padding: 3rem 2rem 4rem; @media (max-width: 1100px) { flex-direction: column; gap: 2rem; }`;
const HeroContent = styled.div`flex: 1; text-align: left; max-width: 580px; @media (max-width: 1100px) { text-align: center; }`;
const MockupContainer = styled.div`flex: 1; position: relative; max-width: 550px; perspective: 1500px; @media (max-width: 1100px) { max-width: 450px; }`;
const MockupWrapper = styled.div`position: relative; animation: ${floatSlow} 8s ease-in-out infinite;`;
const DashboardMockup = styled.div`background: linear-gradient(135deg, rgba(15, 20, 40, 0.98) 0%, rgba(10, 14, 30, 0.98) 100%); border: 1px solid rgba(0, 173, 237, 0.3); border-radius: 20px; padding: 1.25rem; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 173, 237, 0.1); animation: ${glowPulse} 4s ease-in-out infinite; transform: rotateY(-5deg) rotateX(5deg); @media (max-width: 600px) { transform: none; }`;
const MockupHeader = styled.div`display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 1rem;`;
const MockupDots = styled.div`display: flex; gap: 6px; span { width: 10px; height: 10px; border-radius: 50%; } span:nth-child(1) { background: #ef4444; } span:nth-child(2) { background: #fbbf24; } span:nth-child(3) { background: #10b981; }`;
const MockupTitle = styled.div`font-size: 0.8rem; color: #64748b; font-weight: 600;`;
const MockupPortfolio = styled.div`display: flex; align-items: flex-end; gap: 1rem; margin-bottom: 1rem;`;
const MockupValue = styled.div`font-size: 2rem; font-weight: 900; color: #e0e6ed; line-height: 1;`;
const MockupChange = styled.div`font-size: 0.9rem; font-weight: 700; color: #10b981; display: flex; align-items: center; gap: 4px; padding-bottom: 4px;`;
const MockupChart = styled.div`height: 80px; display: flex; align-items: flex-end; gap: 4px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;`;
const MockupBar = styled.div`flex: 1; background: ${p => p.$color || 'linear-gradient(180deg, #00adef 0%, #0088cc 100%)'}; border-radius: 3px 3px 0 0; height: ${p => p.$h}%;`;
const MockupPositions = styled.div`display: flex; gap: 0.5rem;`;
const MockupPosition = styled.div`flex: 1; background: rgba(255, 255, 255, 0.03); border-radius: 8px; padding: 0.6rem;`;
const MockupSymbol = styled.div`font-size: 0.8rem; font-weight: 700; color: #00adef;`;
const MockupPL = styled.div`font-size: 0.75rem; font-weight: 600; color: ${p => p.$up ? '#10b981' : '#ef4444'};`;

const FloatingNotification = styled.div`position: absolute; background: rgba(15, 20, 40, 0.95); border: 1px solid ${p => p.$color || 'rgba(16, 185, 129, 0.4)'}; border-radius: 12px; padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.6rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); animation: ${slideInNotif} 0.6s ease-out forwards, ${floatFast} 4s ease-in-out infinite; animation-delay: ${p => p.$delay || '0s'}, ${p => p.$floatDelay || '0s'}; ${p => p.$top && `top: ${p.$top};`} ${p => p.$bottom && `bottom: ${p.$bottom};`} ${p => p.$left && `left: ${p.$left};`} ${p => p.$right && `right: ${p.$right};`} @media (max-width: 600px) { display: none; }`;
const NotifIcon = styled.div`width: 32px; height: 32px; border-radius: 8px; background: ${p => p.$bg || 'rgba(16, 185, 129, 0.2)'}; display: flex; align-items: center; justify-content: center; color: ${p => p.$color || '#10b981'};`;
const NotifText = styled.div`font-size: 0.75rem; color: #e0e6ed; font-weight: 500;`;
const NotifValue = styled.div`font-size: 0.85rem; font-weight: 700; color: ${p => p.$color || '#10b981'};`;

// ============ ANIMATED STAT COUNTERS ============
const StatCountersSection = styled.section`padding: 4rem 2rem; background: linear-gradient(180deg, rgba(0, 173, 237, 0.03) 0%, transparent 100%);`;
const StatCountersContainer = styled.div`max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }`;
const StatCounter = styled.div`text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(20, 27, 45, 0.6) 0%, rgba(10, 14, 39, 0.6) 100%); border: 1px solid rgba(0, 173, 237, 0.15); border-radius: 16px; transition: all 0.3s ease; &:hover { transform: translateY(-5px); border-color: rgba(0, 173, 237, 0.3); }`;
const StatCounterIcon = styled.div`width: 50px; height: 50px; margin: 0 auto 1rem; border-radius: 12px; background: ${p => p.$bg || 'rgba(0, 173, 237, 0.15)'}; display: flex; align-items: center; justify-content: center; color: ${p => p.$color || '#00adef'};`;
const StatCounterValue = styled.div`font-size: 2.5rem; font-weight: 900; color: ${p => p.$color || '#00adef'}; margin-bottom: 0.5rem; animation: ${countUpPulse} 2s ease-in-out infinite; @media (max-width: 600px) { font-size: 2rem; }`;
const StatCounterLabel = styled.div`font-size: 0.9rem; color: #94a3b8; font-weight: 500;`;

// ============ COMPONENT ============
const LandingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [stats, setStats] = useState({ totalUsers: 0, totalTrades: 0, totalPredictions: 0, predictionAccuracy: 0, resolvedPredictions: 0, correctPredictions: 0 });
    const [topTraders, setTopTraders] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [recentPredictions, setRecentPredictions] = useState([]);
    const [recentWinners, setRecentWinners] = useState([]);
    const [hotStocks, setHotStocks] = useState([]);
    const [marketData, setMarketData] = useState([]);

    const orbs = [
        { size: 600, top: 10, left: -10, color: 'rgba(0, 173, 237, 0.12)', blur: 100, opacity: 0.5, duration: 20, delay: 0 },
        { size: 400, top: 60, left: 75, color: 'rgba(139, 92, 246, 0.12)', blur: 80, opacity: 0.4, duration: 25, delay: 2 },
        { size: 350, top: 35, left: 50, color: 'rgba(0, 255, 136, 0.08)', blur: 70, opacity: 0.3, duration: 22, delay: 1 },
        { size: 300, top: 80, left: 20, color: 'rgba(251, 191, 36, 0.08)', blur: 60, opacity: 0.3, duration: 28, delay: 3 }
    ];

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        await Promise.all([fetchPlatformStats(), fetchTopTraders(), fetchRecentActivity(), fetchRecentPredictions(), fetchMarketData(), fetchRecentWinners(), fetchHotStocks()]);
    };

    // FIXED: Use full API_URL instead of relative paths for production
    const fetchPlatformStats = async () => {
        let statsData = { totalUsers: 0, totalTrades: 0, totalPredictions: 0, predictionAccuracy: 0, resolvedPredictions: 0, correctPredictions: 0, avgWinRate: 0, topPerformerReturn: 0 };
        
        // Use /predictions/platform-stats - same endpoint as PredictionsPage (has correct accuracy!)
        try {
            const res = await fetch(`${API_URL}/predictions/platform-stats`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    statsData.predictionAccuracy = data.accuracy || 0;
                    statsData.totalPredictions = data.totalPredictions || 0;
                    statsData.correctPredictions = data.correctPredictions || 0;
                }
            }
        } catch (err) { console.log('Platform stats endpoint failed:', err); }
        
        // Get user/trade counts from leaderboard
       try {
    const leaderboardRes = await fetch(`${API_URL}/leaderboard/top`);
    if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        const traders = data.topTraders || [];
        if (traders.length > 0) {
            statsData.totalUsers = traders.length;
            statsData.topPerformerReturn = traders[0]?.totalReturnPercent ?? 0;
        }
    }
} catch (err) { console.log('Leaderboard fetch failed:', err); }
        setStats(statsData);
    };

  const fetchRecentWinners = async () => {
    try {
        const res = await fetch(`${API_URL}/leaderboard/winners`);
        if (res.ok) {
            const data = await res.json();
            const traders = data.winners || data || [];
            const winners = traders.slice(0, 4).map(t => ({
                name: 'Anonymous',
                initials: '?',
                trade: `${t.totalTrades || 0} trades`,
                profit: `+${(t.totalReturnPercent || 0).toFixed(1)}%`
            }));
            if (winners.length > 0) { setRecentWinners(winners); return; }
        }
    } catch (err) { console.log('Winners fetch failed'); }
    setRecentWinners([]);
};

    const fetchHotStocks = async () => {
        // Try public endpoint first
        try {
            const res = await fetch(`${API_URL}/public/hot-stocks`);
            if (res.ok) { const data = await res.json(); if (data.success && data.stocks?.length > 0) { setHotStocks(data.stocks); return; } }
        } catch (err) { console.log('Public hot stocks not available'); }
        
        // Try screener endpoint
        try {
            const res = await fetch(`${API_URL}/screener/stocks?changeFilter=gainers&limit=4`);
            if (res.ok) { 
                const data = await res.json(); 
                const stocks = Array.isArray(data) ? data : data.stocks || [];
                if (stocks.length > 0) { 
                    setHotStocks(stocks.slice(0, 4).map(s => ({ symbol: s.symbol, name: s.name || s.shortName || s.symbol, change: s.changePercent || s.change || 0 }))); 
                    return; 
                } 
            }
        } catch (err) { console.log('Screener fallback failed'); }
        
        // Try heatmap data as last resort
        try {
            const res = await fetch(`${API_URL}/heatmap/stocks`);
            if (res.ok) {
                const data = await res.json();
                const stocks = Array.isArray(data) ? data : data.stocks || [];
                const gainers = stocks.filter(s => (s.changePercent || s.change || 0) > 0).sort((a, b) => (b.changePercent || b.change || 0) - (a.changePercent || a.change || 0)).slice(0, 4);
                if (gainers.length > 0) {
                    setHotStocks(gainers.map(s => ({ symbol: s.symbol, name: s.name || s.symbol, change: s.changePercent || s.change || 0 })));
                    return;
                }
            }
        } catch (err) { console.log('Heatmap fallback failed'); }
        
        setHotStocks([]);
    };
const fetchTopTraders = async () => { 
    try { 
        const res = await fetch(`${API_URL}/leaderboard/top`); 
        if (res.ok) { 
            const data = await res.json();
            const traders = data.topTraders || [];
            if (traders.length > 0) {
                setTopTraders(traders);
                setStats(prev => ({ ...prev, topPerformerReturn: traders[0]?.totalReturnPercent ?? 0 }));
            }
        } 
    } catch (err) { console.log('Top traders fetch failed:', err); } 
};
    const fetchRecentActivity = async () => {
        try {
            const res = await fetch(`${API_URL}/posts?limit=8`);
            if (res.ok) {
                const posts = await res.json();
                const postsArray = Array.isArray(posts) ? posts : posts.posts || [];
                const activities = postsArray.slice(0, 6).map((post, i) => ({ id: post._id, type: 'post', user: post.user?.profile?.displayName || post.user?.username || 'Trader', content: post.content?.substring(0, 50) + '...', time: formatTimeAgo(post.createdAt), icon: <MessageSquare size={16} />, bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }));
                setRecentActivity(activities);
            }
        } catch (err) { console.log('Activity fetch failed'); }
    };

    const fetchRecentPredictions = async () => { 
        try { 
            const res = await fetch(`${API_URL}/predictions/recent?limit=5`); 
            if (res.ok) { 
                const predictions = await res.json(); 
                if (Array.isArray(predictions)) { 
                    setRecentPredictions(predictions.slice(0, 4)); 
                } 
            } 
        } catch (err) { console.log('Predictions fetch failed'); } 
    };

    const fetchMarketData = async () => {
        // Try new public endpoint first
        try { 
            const res = await fetch(`${API_URL}/public/market-ticker`); 
            if (res.ok) { 
                const data = await res.json(); 
                if (data.success && data.ticker?.length > 0) { 
                    setMarketData(data.ticker); 
                    return; 
                } 
            } 
        } catch (err) { console.log('Public market ticker not available'); }
        
        // Try to build ticker from heatmap data
        try {
            const [stockRes, cryptoRes] = await Promise.all([
                fetch(`${API_URL}/heatmap/stocks`).catch(() => null),
                fetch(`${API_URL}/heatmap/crypto`).catch(() => null)
            ]);
            
            const results = [];
            
            if (stockRes?.ok) {
                const stockData = await stockRes.json();
                const stocks = Array.isArray(stockData) ? stockData : stockData.stocks || [];
                stocks.slice(0, 4).forEach(s => {
                    if (s.symbol && s.price) {
                        results.push({ symbol: s.symbol, price: s.price, change: s.changePercent || s.change || 0, type: 'stock' });
                    }
                });
            }
            
            if (cryptoRes?.ok) {
                const cryptoData = await cryptoRes.json();
                const cryptos = Array.isArray(cryptoData) ? cryptoData : cryptoData.cryptos || [];
                cryptos.slice(0, 4).forEach(c => {
                    if (c.symbol && c.price) {
                        results.push({ symbol: c.symbol.replace('/USD', '').replace('-USD', ''), price: c.price, change: c.changePercent || c.change || 0, type: 'crypto' });
                    }
                });
            }
            
            if (results.length > 0) {
                setMarketData(results);
                return;
            }
        } catch (err) { console.log('Heatmap ticker fallback failed'); }
        
        setMarketData([]);
    };

    const formatTimeAgo = (date) => { if (!date) return 'Recently'; const seconds = Math.floor((new Date() - new Date(date)) / 1000); if (seconds < 60) return 'Just now'; if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`; if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; return `${Math.floor(seconds / 86400)}d ago`; };
    const formatNumber = (num) => { if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; return num.toLocaleString(); };
    const getInitials = (name) => { if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2); };
    const getDisplayName = (trader) => { if (!trader.user) return 'Anonymous'; return trader.user.profile?.displayName || trader.user.username || trader.user.name || 'Anonymous'; };
    const getAvatar = (trader) => trader.user?.profile?.avatar || null;
    const goToProfile = (username) => { if (username) navigate(`/profile/${username}`); };

    const features = [
        { icon: <Brain size={26} />, gradient: 'linear-gradient(135deg, #00adef, #0088cc)', title: 'AI-Powered Predictions', description: 'Machine learning models analyze patterns to deliver high-accuracy price predictions for stocks and crypto.' },
        { icon: <Activity size={26} />, gradient: 'linear-gradient(135deg, #10b981, #059669)', title: 'Real-Time Market Data', description: 'Live stock and crypto prices with instant updates. Never miss a market movement.' },
        { icon: <Users size={26} />, gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', title: 'Social Trading', description: "Follow top traders, share insights, and learn from the community's collective wisdom." },
        { icon: <Trophy size={26} />, gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', title: 'Gamified Experience', description: 'Earn XP, level up, unlock achievements, and compete on leaderboards as you trade.' },
        { icon: <Shield size={26} />, gradient: 'linear-gradient(135deg, #00ff88, #00cc70)', title: 'Paper Trading', description: 'Practice risk-free with $100K virtual money. Perfect your strategy before going live.' },
        { icon: <Coins size={26} />, gradient: 'linear-gradient(135deg, #ec4899, #db2777)', title: 'The Vault', description: 'Earn Nexus Coins and unlock exclusive borders, badges, themes, and perks.' }
    ];

    return (
        <LandingContainer>
            <SEO
                title="Nexus Signal AI - Revolutionary AI Trading Tool"
                description="A revolutionary trading tool powered by AI. Get stock predictions, real-time market insights, and intelligent portfolio management. Join thousands of traders using machine learning for smarter decisions."
                keywords="AI stock predictions, stock market analysis, revolutionary trading tool, portfolio management, machine learning trading, stock signals, investment tools"
            />
<BackgroundEffects>
    <GridOverlay />
    {orbs.map((orb, i) => (<GradientOrb key={i} {...Object.fromEntries(Object.entries(orb).map(([k,v]) => [`$${k}`, v]))} />))}
</BackgroundEffects>

            <ContentWrapper>
                <Nav>
                    <Logo onClick={() => navigate('/')}><TrendingUp size={28} />Nexus Signal</Logo>
                    <NavLinks>
                        {isAuthenticated ? (<NavButton $primary onClick={() => navigate('/dashboard')}>Go to Dashboard</NavButton>) : (<><NavButton onClick={() => navigate('/login')}>Log In</NavButton><NavButton $primary onClick={() => navigate('/register')}>Get Started Free</NavButton></>)}
                    </NavLinks>
                </Nav>

                <AnnouncementBanner>
                    <AnnouncementContent>
                        <AnnouncementHighlight $delay="0.1s">
                            <HighlightIcon $gradient="linear-gradient(135deg, #fbbf24, #f59e0b)"><Trophy size={24} /></HighlightIcon>
                            <HighlightText>
                                <HighlightValue $color="#fbbf24">{(() => { const ret = topTraders[0]?.totalReturnPercent ?? stats.topPerformerReturn; return ret !== undefined && ret !== null && ret !== 0 ? `${ret >= 0 ? '+' : ''}${Number(ret).toFixed(1)}%` : '—'; })()}</HighlightValue>
                                <HighlightLabel>Top Trader Return</HighlightLabel>
                            </HighlightText>
                        </AnnouncementHighlight>
                        <LaunchBadge><LaunchLabel>🚀 Official Launch</LaunchLabel><LaunchDate>March 2026</LaunchDate><LaunchSubtext>Join the beta now!</LaunchSubtext></LaunchBadge>
                        <AnnouncementHighlight $delay="0.2s">
                            <HighlightIcon $gradient="linear-gradient(135deg, #10b981, #059669)"><Target size={24} /></HighlightIcon>
                            <HighlightText>
                                <HighlightValue $color="#10b981">{stats.predictionAccuracy > 0 ? `${stats.predictionAccuracy.toFixed(1)}%` : '—'}</HighlightValue>
                                <HighlightLabel>AI Prediction Accuracy</HighlightLabel>
                            </HighlightText>
                        </AnnouncementHighlight>
                        <AnnouncementHighlight $delay="0.3s">
                            <HighlightIcon $gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"><DollarSign size={24} /></HighlightIcon>
                            <HighlightText><HighlightValue $color="#a78bfa">$100K</HighlightValue><HighlightLabel>Free Paper Money</HighlightLabel></HighlightText>
                        </AnnouncementHighlight>
                    </AnnouncementContent>
                </AnnouncementBanner>

                {marketData.length > 0 && (
                    <TickerWrapper>
                        <TickerTrack>
                            {[...marketData, ...marketData].map((stock, i) => (
                                <TickerItem key={i}>
                                    <TickerSymbol $crypto={stock.type === 'crypto'}>{stock.symbol}</TickerSymbol>
                                    <TickerPrice>${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TickerPrice>
                                    <TickerChange $positive={stock.change >= 0}>{stock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%</TickerChange>
                                </TickerItem>
                            ))}
                        </TickerTrack>
                    </TickerWrapper>
                )}

                <ShowcaseSection>
                    <ShowcaseContainer>
                        <ShowcaseCard $borderColor="rgba(16, 185, 129, 0.3)" $delay="0.1s">
                            <ShowcaseHeader><ShowcaseTitle $color="#10b981"><Trophy size={18} />Recent Winners</ShowcaseTitle><ShowcaseBadge><LiveDot style={{ width: 6, height: 6 }} />Live</ShowcaseBadge></ShowcaseHeader>
                            {recentWinners.length > 0 ? recentWinners.map((w, i) => (<WinnerItem key={i}><WinnerAvatar>{w.initials}</WinnerAvatar><WinnerInfo><WinnerName>{w.name}</WinnerName><WinnerTrade>{w.trade}</WinnerTrade></WinnerInfo><WinnerProfit>{w.profit}</WinnerProfit></WinnerItem>)) : (<WinnerItem><WinnerAvatar>?</WinnerAvatar><WinnerInfo><WinnerName>Be the first winner!</WinnerName><WinnerTrade>Start trading now</WinnerTrade></WinnerInfo></WinnerItem>)}
                        </ShowcaseCard>
                        <ShowcaseCard $borderColor="rgba(251, 191, 36, 0.3)" $delay="0.2s">
                            <ShowcaseHeader><ShowcaseTitle $color="#fbbf24"><Flame size={18} />Hot Stocks Today</ShowcaseTitle><ShowcaseBadge><TrendingUp size={12} />Gainers</ShowcaseBadge></ShowcaseHeader>
                            {hotStocks.length > 0 ? hotStocks.map((s, i) => (<HotStock key={i}><div><HotStockSymbol>{s.symbol}</HotStockSymbol><HotStockName>{s.name}</HotStockName></div><HotStockChange $positive={s.change >= 0}>{s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%</HotStockChange></HotStock>)) : (<HotStock><div><HotStockSymbol>—</HotStockSymbol><HotStockName>Loading market data...</HotStockName></div></HotStock>)}
                        </ShowcaseCard>
                        <ShowcaseCard $borderColor="rgba(139, 92, 246, 0.3)" $delay="0.3s">
                            <ShowcaseHeader><ShowcaseTitle $color="#a78bfa"><BarChart3 size={18} />Platform Stats</ShowcaseTitle><ShowcaseBadge><LiveDot style={{ width: 6, height: 6 }} />Live</ShowcaseBadge></ShowcaseHeader>
                            <QuickStat><QuickStatIcon $bg="rgba(0, 173, 237, 0.15)" $color="#00adef"><Users size={18} /></QuickStatIcon><QuickStatInfo><QuickStatValue>{formatNumber(stats.totalUsers)}</QuickStatValue><QuickStatLabel>Active Traders</QuickStatLabel></QuickStatInfo></QuickStat>
                            <QuickStat><QuickStatIcon $bg="rgba(16, 185, 129, 0.15)" $color="#10b981"><Brain size={18} /></QuickStatIcon><QuickStatInfo><QuickStatValue>{formatNumber(stats.totalPredictions)}</QuickStatValue><QuickStatLabel>AI Predictions Made</QuickStatLabel></QuickStatInfo></QuickStat>
                            <QuickStat><QuickStatIcon $bg="rgba(251, 191, 36, 0.15)" $color="#fbbf24"><Target size={18} /></QuickStatIcon><QuickStatInfo><QuickStatValue>{stats.predictionAccuracy > 0 ? `${stats.predictionAccuracy.toFixed(1)}%` : '—'}</QuickStatValue><QuickStatLabel>Prediction Accuracy ({stats.resolvedPredictions || 0} resolved)</QuickStatLabel></QuickStatInfo></QuickStat>
                        </ShowcaseCard>
                    </ShowcaseContainer>
                </ShowcaseSection>

                {/* Enhanced Hero with Dashboard Mockup */}
                <HeroWithMockup>
                    <HeroContent>
                        <HeroBadge><Sparkles size={16} />Revolutionary AI Trading Tool</HeroBadge>
                        <HeroTitle>Trade Smarter with<br /><span className="gradient">AI-Driven Insights</span></HeroTitle>
                        <HeroSubtitle>A revolutionary tool that harnesses machine learning predictions, real-time market data, and social trading to help you make better investment decisions. Practice risk-free with paper trading.</HeroSubtitle>
                        <HeroCTA style={{ justifyContent: 'flex-start' }}>
                            <PrimaryButton onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}><Rocket size={20} />Start Trading Free<ArrowRight size={18} /></PrimaryButton>
                            <SecondaryButton onClick={() => navigate('/leaderboard')}><Trophy size={20} />View Leaderboard</SecondaryButton>
                        </HeroCTA>
                    </HeroContent>
                    <MockupContainer>
                        <MockupWrapper>
                            <DashboardMockup>
                                <MockupHeader>
                                    <MockupDots><span></span><span></span><span></span></MockupDots>
                                    <MockupTitle>Portfolio Overview</MockupTitle>
                                </MockupHeader>
                                <MockupPortfolio>
                                    <MockupValue>$127,845.32</MockupValue>
                                    <MockupChange><TrendingUp size={16} />+27.8%</MockupChange>
                                </MockupPortfolio>
                                <MockupChart>
                                    {[40, 55, 45, 60, 50, 75, 65, 80, 70, 85, 75, 95].map((h, i) => (
                                        <MockupBar key={i} $h={h} $color={i > 5 ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : undefined} />
                                    ))}
                                </MockupChart>
                                <MockupPositions>
                                    <MockupPosition>
                                        <MockupSymbol>NVDA</MockupSymbol>
                                        <MockupPL $up>+18.4%</MockupPL>
                                    </MockupPosition>
                                    <MockupPosition>
                                        <MockupSymbol>AAPL</MockupSymbol>
                                        <MockupPL $up>+5.2%</MockupPL>
                                    </MockupPosition>
                                    <MockupPosition>
                                        <MockupSymbol>BTC</MockupSymbol>
                                        <MockupPL $up>+12.7%</MockupPL>
                                    </MockupPosition>
                                </MockupPositions>
                            </DashboardMockup>
                            {/* Floating Notifications */}
                            <FloatingNotification $top="-20px" $right="-40px" $delay="0.3s" $floatDelay="0s" $color="rgba(16, 185, 129, 0.4)">
                                <NotifIcon $bg="rgba(16, 185, 129, 0.2)" $color="#10b981"><TrendingUp size={16} /></NotifIcon>
                                <div>
                                    <NotifText>AI Prediction</NotifText>
                                    <NotifValue $color="#10b981">NVDA → UP 87%</NotifValue>
                                </div>
                            </FloatingNotification>
                            <FloatingNotification $bottom="60px" $left="-50px" $delay="0.6s" $floatDelay="0.5s" $color="rgba(251, 191, 36, 0.4)">
                                <NotifIcon $bg="rgba(251, 191, 36, 0.2)" $color="#fbbf24"><Trophy size={16} /></NotifIcon>
                                <div>
                                    <NotifText>Achievement!</NotifText>
                                    <NotifValue $color="#fbbf24">First Trade 🎉</NotifValue>
                                </div>
                            </FloatingNotification>
                            <FloatingNotification $bottom="-10px" $right="20px" $delay="0.9s" $floatDelay="1s" $color="rgba(139, 92, 246, 0.4)">
                                <NotifIcon $bg="rgba(139, 92, 246, 0.2)" $color="#a78bfa"><Zap size={16} /></NotifIcon>
                                <div>
                                    <NotifText>Level Up!</NotifText>
                                    <NotifValue $color="#a78bfa">+500 XP</NotifValue>
                                </div>
                            </FloatingNotification>
                        </MockupWrapper>
                    </MockupContainer>
                </HeroWithMockup>

                {/* How It Works Section */}
                <HowItWorksSection>
                    <HowItWorksContainer>
                        <SectionHeader>
                            <SectionBadge $bg="rgba(139, 92, 246, 0.1)" $border="rgba(139, 92, 246, 0.3)" $color="#a78bfa">
                                <Play size={14} />
                                How It Works
                            </SectionBadge>
                            <SectionTitle>Start Trading in 3 Simple Steps</SectionTitle>
                            <SectionSubtitle>From sign-up to your first trade in minutes. No experience required.</SectionSubtitle>
                        </SectionHeader>
                        <StepsContainer>
                            <StepConnector />
                            <StepCard $delay="0.1s">
                                <StepNumber $gradient="linear-gradient(135deg, #00adef, #0088cc)" $shadow="rgba(0, 173, 237, 0.4)" $borderColor="rgba(0, 173, 237, 0.3)" $floatDelay="0s">
                                    <StepIconWrap><UserPlus size={32} /></StepIconWrap>
                                </StepNumber>
                                <StepTitle>Create Your Account</StepTitle>
                                <StepDescription>Sign up in seconds with just your email. No credit card required, ever.</StepDescription>
                                <StepBadge $bg="rgba(0, 173, 237, 0.1)" $border="rgba(0, 173, 237, 0.3)" $color="#00adef">
                                    <Zap size={12} />30 Seconds
                                </StepBadge>
                            </StepCard>
                            <StepCard $delay="0.3s">
                                <StepNumber $gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" $shadow="rgba(139, 92, 246, 0.4)" $borderColor="rgba(139, 92, 246, 0.3)" $floatDelay="0.5s">
                                    <StepIconWrap><Brain size={32} /></StepIconWrap>
                                </StepNumber>
                                <StepTitle>Get AI Insights</StepTitle>
                                <StepDescription>Receive real-time predictions, market signals, and personalized trading recommendations.</StepDescription>
                                <StepBadge $bg="rgba(139, 92, 246, 0.1)" $border="rgba(139, 92, 246, 0.3)" $color="#a78bfa">
                                    <Target size={12} />High Accuracy
                                </StepBadge>
                            </StepCard>
                            <StepCard $delay="0.5s">
                                <StepNumber $gradient="linear-gradient(135deg, #10b981, #059669)" $shadow="rgba(16, 185, 129, 0.4)" $borderColor="rgba(16, 185, 129, 0.3)" $floatDelay="1s">
                                    <StepIconWrap><TrendingUp size={32} /></StepIconWrap>
                                </StepNumber>
                                <StepTitle>Trade & Learn</StepTitle>
                                <StepDescription>Practice with $100K virtual money, compete on leaderboards, and level up your skills.</StepDescription>
                                <StepBadge $bg="rgba(16, 185, 129, 0.1)" $border="rgba(16, 185, 129, 0.3)" $color="#10b981">
                                    <Shield size={12} />Risk-Free
                                </StepBadge>
                            </StepCard>
                        </StepsContainer>
                    </HowItWorksContainer>
                </HowItWorksSection>

                {/* Feature Demos Section */}
                <DemoSection>
                    <DemoContainer>
                        <SectionHeader>
                            <SectionBadge $bg="rgba(0, 173, 237, 0.1)" $border="rgba(0, 173, 237, 0.3)" $color="#00adef">
                                <Eye size={14} />
                                See It In Action
                            </SectionBadge>
                            <SectionTitle>Powerful Features, Beautiful Interface</SectionTitle>
                            <SectionSubtitle>Experience professional-grade trading tools designed for traders of all levels.</SectionSubtitle>
                        </SectionHeader>
                        <DemoGrid>
                            {/* AI Predictions Demo */}
                            <DemoCard $delay="0.1s" $borderColor="rgba(16, 185, 129, 0.2)" $hoverBorder="rgba(16, 185, 129, 0.5)" $shadow="rgba(16, 185, 129, 0.15)">
                                <DemoHeader>
                                    <DemoTitleGroup>
                                        <DemoIconWrap $gradient="linear-gradient(135deg, #10b981, #059669)"><Brain size={22} /></DemoIconWrap>
                                        <div><DemoTitle>AI Predictions</DemoTitle><DemoSubtitle>Machine learning-powered forecasts</DemoSubtitle></div>
                                    </DemoTitleGroup>
                                    <DemoBadge>Live</DemoBadge>
                                </DemoHeader>
                                <DemoPreview>
                                    <PredictionDemoWrap>
                                        <MiniChart>
                                            {[65, 45, 70, 55, 80, 60, 75, 85, 70, 90, 75, 95].map((h, i) => (
                                                <ChartBar key={i} $height={h} $up={i > 5} $duration={`${1.5 + i * 0.1}s`} $delay={`${i * 0.1}s`} />
                                            ))}
                                            <PredictionOverlay><TrendingUp size={16} />+12.4%</PredictionOverlay>
                                        </MiniChart>
                                        <AnalysisRow $color="#10b981">
                                            <AnalysisLabel>AI Confidence</AnalysisLabel>
                                            <AnalysisValue $color="#10b981">87%</AnalysisValue>
                                        </AnalysisRow>
                                        <AnalysisRow $color="#00adef">
                                            <AnalysisLabel>Technical Signal</AnalysisLabel>
                                            <AnalysisValue $color="#00adef">Strong Buy</AnalysisValue>
                                        </AnalysisRow>
                                        <AnalysisRow $color="#a78bfa">
                                            <AnalysisLabel>Sentiment Score</AnalysisLabel>
                                            <AnalysisValue $color="#a78bfa">Bullish</AnalysisValue>
                                        </AnalysisRow>
                                    </PredictionDemoWrap>
                                </DemoPreview>
                            </DemoCard>

                            {/* Paper Trading Demo */}
                            <DemoCard $delay="0.2s" $borderColor="rgba(0, 173, 237, 0.2)" $hoverBorder="rgba(0, 173, 237, 0.5)" $shadow="rgba(0, 173, 237, 0.15)">
                                <DemoHeader>
                                    <DemoTitleGroup>
                                        <DemoIconWrap $gradient="linear-gradient(135deg, #00adef, #0088cc)"><LineChart size={22} /></DemoIconWrap>
                                        <div><DemoTitle>Paper Trading</DemoTitle><DemoSubtitle>Practice with $100K virtual cash</DemoSubtitle></div>
                                    </DemoTitleGroup>
                                    <DemoBadge $bg="rgba(0, 173, 237, 0.15)" $color="#00adef">Risk-Free</DemoBadge>
                                </DemoHeader>
                                <DemoPreview>
                                    <TradingDemoWrap>
                                        <TradingHeader>
                                            <TradingSymbol>AAPL</TradingSymbol>
                                            <TradingPrice>$198.45 <span>+2.34%</span></TradingPrice>
                                        </TradingHeader>
                                        <TradingActions>
                                            <TradingButton $buy>Buy</TradingButton>
                                            <TradingButton>Sell</TradingButton>
                                        </TradingActions>
                                        <PortfolioPreview>
                                            <PortfolioRow>
                                                <PortfolioLabel>Portfolio Value</PortfolioLabel>
                                                <PortfolioValue $color="#10b981">$112,847.50</PortfolioValue>
                                            </PortfolioRow>
                                            <PortfolioRow>
                                                <PortfolioLabel>Today's P/L</PortfolioLabel>
                                                <PortfolioValue $color="#10b981">+$1,234.80</PortfolioValue>
                                            </PortfolioRow>
                                            <PortfolioRow>
                                                <PortfolioLabel>Win Rate</PortfolioLabel>
                                                <PortfolioValue>68%</PortfolioValue>
                                            </PortfolioRow>
                                        </PortfolioPreview>
                                    </TradingDemoWrap>
                                </DemoPreview>
                            </DemoCard>

                            {/* Social Trading Demo */}
                            <DemoCard $delay="0.3s" $borderColor="rgba(139, 92, 246, 0.2)" $hoverBorder="rgba(139, 92, 246, 0.5)" $shadow="rgba(139, 92, 246, 0.15)">
                                <DemoHeader>
                                    <DemoTitleGroup>
                                        <DemoIconWrap $gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"><Users size={22} /></DemoIconWrap>
                                        <div><DemoTitle>Social Trading</DemoTitle><DemoSubtitle>Learn from top traders</DemoSubtitle></div>
                                    </DemoTitleGroup>
                                    <DemoBadge $bg="rgba(139, 92, 246, 0.15)" $color="#a78bfa">Community</DemoBadge>
                                </DemoHeader>
                                <DemoPreview>
                                    <SocialDemoWrap>
                                        <SocialPost $delay="0s">
                                            <SocialHeader>
                                                <SocialAvatar $bg="linear-gradient(135deg, #fbbf24, #f59e0b)">TC</SocialAvatar>
                                                <SocialName>TopCrypto</SocialName>
                                                <SocialTime>2m ago</SocialTime>
                                            </SocialHeader>
                                            <SocialContent>Just opened a position in NVDA. AI chip demand is insane right now 🚀</SocialContent>
                                            <SocialStats>
                                                <SocialStat><Star size={12} />42</SocialStat>
                                                <SocialStat><MessageSquare size={12} />12</SocialStat>
                                            </SocialStats>
                                        </SocialPost>
                                        <SocialPost $delay="0.2s">
                                            <SocialHeader>
                                                <SocialAvatar $bg="linear-gradient(135deg, #10b981, #059669)">MV</SocialAvatar>
                                                <SocialName>MarketVet</SocialName>
                                                <SocialTime>5m ago</SocialTime>
                                            </SocialHeader>
                                            <SocialContent>BTC breaking resistance at $68K. Next target $72K 📈</SocialContent>
                                            <SocialStats>
                                                <SocialStat><Star size={12} />89</SocialStat>
                                                <SocialStat><MessageSquare size={12} />34</SocialStat>
                                            </SocialStats>
                                        </SocialPost>
                                    </SocialDemoWrap>
                                </DemoPreview>
                            </DemoCard>

                            {/* Gamification Demo */}
                            <DemoCard $delay="0.4s" $borderColor="rgba(251, 191, 36, 0.2)" $hoverBorder="rgba(251, 191, 36, 0.5)" $shadow="rgba(251, 191, 36, 0.15)">
                                <DemoHeader>
                                    <DemoTitleGroup>
                                        <DemoIconWrap $gradient="linear-gradient(135deg, #fbbf24, #f59e0b)"><Trophy size={22} /></DemoIconWrap>
                                        <div><DemoTitle>Gamification</DemoTitle><DemoSubtitle>Level up & earn rewards</DemoSubtitle></div>
                                    </DemoTitleGroup>
                                    <DemoBadge $bg="rgba(251, 191, 36, 0.15)" $color="#fbbf24">Rewards</DemoBadge>
                                </DemoHeader>
                                <DemoPreview>
                                    <GamificationDemoWrap>
                                        <LevelBadge>
                                            <Award size={20} color="#a78bfa" />
                                            <LevelNumber>Level 12</LevelNumber>
                                            <LevelText>Rising Trader</LevelText>
                                        </LevelBadge>
                                        <XPBar>
                                            <XPFill $percent="72%" />
                                            <XPText>7,200 / 10,000 XP</XPText>
                                        </XPBar>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Achievements Unlocked</div>
                                        <AchievementGrid>
                                            <AchievementBadge $unlocked><Trophy size={20} /></AchievementBadge>
                                            <AchievementBadge $unlocked><Target size={20} /></AchievementBadge>
                                            <AchievementBadge $unlocked><Flame size={20} /></AchievementBadge>
                                            <AchievementBadge $unlocked><Star size={20} /></AchievementBadge>
                                            <AchievementBadge $unlocked><Zap size={20} /></AchievementBadge>
                                            <AchievementBadge $unlocked><Crown size={20} /></AchievementBadge>
                                            <AchievementBadge><Lock size={18} /></AchievementBadge>
                                            <AchievementBadge><Lock size={18} /></AchievementBadge>
                                        </AchievementGrid>
                                    </GamificationDemoWrap>
                                </DemoPreview>
                            </DemoCard>
                        </DemoGrid>
                    </DemoContainer>
                </DemoSection>

                {/* Animated Platform Stats */}
                <StatCountersSection>
                    <StatCountersContainer>
                        <StatCounter>
                            <StatCounterIcon $bg="rgba(0, 173, 237, 0.15)" $color="#00adef">
                                <Users size={24} />
                            </StatCounterIcon>
                            <StatCounterValue $color="#00adef">
                                {stats.totalUsers > 0 ? formatNumber(stats.totalUsers) : '1,000+'}
                            </StatCounterValue>
                            <StatCounterLabel>Active Traders</StatCounterLabel>
                        </StatCounter>
                        <StatCounter>
                            <StatCounterIcon $bg="rgba(16, 185, 129, 0.15)" $color="#10b981">
                                <Brain size={24} />
                            </StatCounterIcon>
                            <StatCounterValue $color="#10b981">
                                {stats.totalPredictions > 0 ? formatNumber(stats.totalPredictions) : '5,000+'}
                            </StatCounterValue>
                            <StatCounterLabel>AI Predictions</StatCounterLabel>
                        </StatCounter>
                        <StatCounter>
                            <StatCounterIcon $bg="rgba(251, 191, 36, 0.15)" $color="#fbbf24">
                                <Target size={24} />
                            </StatCounterIcon>
                            <StatCounterValue $color="#fbbf24">
                                {stats.predictionAccuracy > 0 ? `${stats.predictionAccuracy.toFixed(0)}%` : '85%+'}
                            </StatCounterValue>
                            <StatCounterLabel>Accuracy Rate</StatCounterLabel>
                        </StatCounter>
                        <StatCounter>
                            <StatCounterIcon $bg="rgba(139, 92, 246, 0.15)" $color="#a78bfa">
                                <DollarSign size={24} />
                            </StatCounterIcon>
                            <StatCounterValue $color="#a78bfa">$100K</StatCounterValue>
                            <StatCounterLabel>Free Paper Money</StatCounterLabel>
                        </StatCounter>
                    </StatCountersContainer>
                </StatCountersSection>

                <ActivitySection>
                    <ActivityContainer>
                        <SectionHeader><SectionBadge><Activity size={14} />Live Activity</SectionBadge><SectionTitle>See What's Happening Now</SectionTitle><SectionSubtitle>Real-time trades, predictions, and community activity from our platform.</SectionSubtitle></SectionHeader>
                        <ActivityGrid>
                            <ActivityFeed>
                                <ActivityTitle><MessageSquare size={18} />Recent Activity</ActivityTitle>
                                {recentActivity.length > 0 ? recentActivity.map((a, i) => (<ActivityItem key={a.id || i} $delay={i * 0.1}><ActivityIcon $bg={a.bg} $color={a.color}>{a.icon}</ActivityIcon><ActivityContent><ActivityText><strong>{a.user}</strong> posted: {a.content}</ActivityText><ActivityTime>{a.time}</ActivityTime></ActivityContent></ActivityItem>)) : (
                                    <>
                                        <ActivityItem $delay={0}><ActivityIcon $bg="rgba(0, 173, 237, 0.15)" $color="#00adef"><TrendingUp size={16} /></ActivityIcon><ActivityContent><ActivityText><strong>TraderPro</strong> opened position in <strong>NVDA</strong></ActivityText><ActivityTime>Demo</ActivityTime></ActivityContent></ActivityItem>
                                        <ActivityItem $delay={0.1}><ActivityIcon $bg="rgba(16, 185, 129, 0.15)" $color="#10b981"><Trophy size={16} /></ActivityIcon><ActivityContent><ActivityText><strong>CryptoKing</strong> reached <strong>Level 10</strong></ActivityText><ActivityTime>Demo</ActivityTime></ActivityContent></ActivityItem>
                                        <ActivityItem $delay={0.2}><ActivityIcon $bg="rgba(139, 92, 246, 0.15)" $color="#a78bfa"><MessageSquare size={16} /></ActivityIcon><ActivityContent><ActivityText><strong>MarketWatch</strong> posted: "BTC looking bullish..."</ActivityText><ActivityTime>Demo</ActivityTime></ActivityContent></ActivityItem>
                                        <ActivityItem $delay={0.3}><ActivityIcon $bg="rgba(251, 191, 36, 0.15)" $color="#fbbf24"><Sparkles size={16} /></ActivityIcon><ActivityContent><ActivityText>Join the community to see live activity!</ActivityText></ActivityContent></ActivityItem>
                                    </>
                                )}
                            </ActivityFeed>
                            <PredictionsFeed>
                                <ActivityTitle style={{ color: '#10b981' }}><Brain size={18} />Latest AI Predictions</ActivityTitle>
                                {recentPredictions.length > 0 ? recentPredictions.map((p, i) => (<PredictionItem key={p._id || i}><PredictionSymbol>{p.symbol}</PredictionSymbol><PredictionDirection $up={p.direction === 'UP'}>{p.direction === 'UP' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{p.direction}</PredictionDirection><PredictionInfo><PredictionTarget>Target: ${p.targetPrice?.toFixed(2)}</PredictionTarget></PredictionInfo><PredictionConfidence>{p.confidence?.toFixed(0)}%</PredictionConfidence></PredictionItem>)) : (
                                    <>
                                        <PredictionItem style={{ opacity: 0.7 }}><PredictionSymbol>NVDA</PredictionSymbol><PredictionDirection $up><TrendingUp size={14} />UP</PredictionDirection><PredictionInfo><PredictionTarget>Target: $145.50</PredictionTarget></PredictionInfo><PredictionConfidence>87%</PredictionConfidence></PredictionItem>
                                        <PredictionItem style={{ opacity: 0.7 }}><PredictionSymbol>AAPL</PredictionSymbol><PredictionDirection $up><TrendingUp size={14} />UP</PredictionDirection><PredictionInfo><PredictionTarget>Target: $198.00</PredictionTarget></PredictionInfo><PredictionConfidence>82%</PredictionConfidence></PredictionItem>
                                        <PredictionItem style={{ opacity: 0.7 }}><PredictionSymbol>BTC</PredictionSymbol><PredictionDirection $up><TrendingUp size={14} />UP</PredictionDirection><PredictionInfo><PredictionTarget>Target: $72,500</PredictionTarget></PredictionInfo><PredictionConfidence>79%</PredictionConfidence></PredictionItem>
                                        <PredictionItem><PredictionSymbol style={{ color: '#fbbf24' }}>✨</PredictionSymbol><PredictionInfo><PredictionTarget>Sign up to see live AI predictions</PredictionTarget></PredictionInfo></PredictionItem>
                                    </>
                                )}
                            </PredictionsFeed>
                        </ActivityGrid>
                    </ActivityContainer>
                </ActivitySection>

                <TradersSection>
                    <TradersContainer>
                        <SectionHeader><SectionBadge $bg="rgba(251, 191, 36, 0.1)" $border="rgba(251, 191, 36, 0.3)" $color="#fbbf24"><Crown size={14} />Leaderboard</SectionBadge><SectionTitle>Top Traders This Month</SectionTitle><SectionSubtitle>Follow the best performers and learn from their strategies.</SectionSubtitle></SectionHeader>
                        <TradersGrid>
                            {topTraders.length > 0 ? topTraders.slice(0, 6).map((t, i) => {
                                const avatar = getAvatar(t); const name = getDisplayName(t); const username = t.user?.username;
                                return (<TraderCard key={t.user?._id || i} $rank={t.rank} $delay={i * 0.1} onClick={() => goToProfile(username)}>
                                    <TraderRank $rank={t.rank}>{t.rank <= 3 ? <Crown size={18} /> : `#${t.rank}`}</TraderRank>
                                    <TraderAvatar $rank={t.rank}>{avatar ? <img src={avatar} alt={name} /> : getInitials(name)}</TraderAvatar>
                                    <TraderInfo><TraderName>{name}{t.user?.profile?.verified && <VerifiedBadge><CheckCircle size={14} /></VerifiedBadge>}</TraderName><TraderMeta><TraderStat>{t.totalTrades || 0} trades</TraderStat><TraderStat $highlight>{(t.winRate || 0).toFixed(0)}% win</TraderStat></TraderMeta></TraderInfo>
                                    <TraderReturn $positive={(t.profitLossPercent || 0) >= 0}>{(t.profitLossPercent || 0) >= 0 ? '+' : ''}{(t.profitLossPercent || 0).toFixed(1)}%</TraderReturn>
                                </TraderCard>);
                            }) : (
                                /* Demo traders for empty state */
                                [
                                    { rank: 1, initials: 'TC', name: 'TopCrypto', trades: 156, winRate: 78, return: 127.5 },
                                    { rank: 2, initials: 'MV', name: 'MarketVet', trades: 203, winRate: 72, return: 89.2 },
                                    { rank: 3, initials: 'AS', name: 'AlphaSig', trades: 134, winRate: 68, return: 67.8 },
                                    { rank: 4, initials: 'DT', name: 'DayTrader', trades: 298, winRate: 65, return: 54.3 },
                                    { rank: 5, initials: 'CP', name: 'CryptoPro', trades: 187, winRate: 71, return: 48.9 },
                                    { rank: 6, initials: 'SH', name: 'StockHawk', trades: 142, winRate: 67, return: 42.1 }
                                ].map((t, i) => (
                                    <TraderCard key={i} $rank={t.rank} $delay={i * 0.1} style={{ opacity: 0.8, cursor: 'default' }}>
                                        <TraderRank $rank={t.rank}>{t.rank <= 3 ? <Crown size={18} /> : `#${t.rank}`}</TraderRank>
                                        <TraderAvatar $rank={t.rank}>{t.initials}</TraderAvatar>
                                        <TraderInfo><TraderName>{t.name}</TraderName><TraderMeta><TraderStat>{t.trades} trades</TraderStat><TraderStat $highlight>{t.winRate}% win</TraderStat></TraderMeta></TraderInfo>
                                        <TraderReturn $positive>+{t.return}%</TraderReturn>
                                    </TraderCard>
                                ))
                            )}
                        </TradersGrid>
                    </TradersContainer>
                </TradersSection>

                <FeaturesSection>
                    <FeaturesContainer>
                        <SectionHeader><SectionBadge $bg="rgba(0, 173, 237, 0.1)" $border="rgba(0, 173, 237, 0.3)" $color="#00adef"><Zap size={14} />Features</SectionBadge><SectionTitle>Everything You Need to Trade</SectionTitle><SectionSubtitle>Professional-grade tools designed for traders of all levels.</SectionSubtitle></SectionHeader>
                        <FeatureGrid>{features.map((f, i) => (<FeatureCard key={i} $index={i} $delay={i * 0.1}><FeatureIcon $gradient={f.gradient} $delay={i * 0.5}>{f.icon}</FeatureIcon><FeatureTitle>{f.title}</FeatureTitle><FeatureDescription>{f.description}</FeatureDescription></FeatureCard>))}</FeatureGrid>
                    </FeaturesContainer>
                </FeaturesSection>

                <SocialProofSection>
                    <SocialProofContainer>
                        <ProofCard><ProofValue $color="#00adef">$100K</ProofValue><ProofLabel>Starting Paper Balance</ProofLabel></ProofCard>
                        <ProofCard><ProofValue $color="#10b981">20x</ProofValue><ProofLabel>Max Leverage</ProofLabel></ProofCard>
                        <ProofCard><ProofValue $color="#a78bfa">91+</ProofValue><ProofLabel>Achievements to Unlock</ProofLabel></ProofCard>
                        <ProofCard><ProofValue $color="#fbbf24">24/7</ProofValue><ProofLabel>Crypto Trading</ProofLabel></ProofCard>
                    </SocialProofContainer>
                </SocialProofSection>

                <CTASection>
                    <CTACard>
                        <CTATitle>Ready to Start Trading?</CTATitle>
                        <CTADescription>Join traders using AI-powered insights to make smarter decisions. Start with $100K in paper money — completely free.</CTADescription>
                        <PrimaryButton onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')} style={{ margin: '0 auto', position: 'relative', zIndex: 1 }}><Rocket size={20} />{isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}<ArrowRight size={18} /></PrimaryButton>
                        <TrustBadges>
                            <TrustBadge><CheckCircle size={16} />No credit card required</TrustBadge>
                            <TrustBadge><CheckCircle size={16} />Free forever plan</TrustBadge>
                            <TrustBadge><CheckCircle size={16} />$100K paper money</TrustBadge>
                        </TrustBadges>
                    </CTACard>
                </CTASection>

                <PoweredBySection>
                    <PoweredByContainer>
                        <PoweredByTitle>Powered By</PoweredByTitle>
                        <PoweredByGrid>
                            <PoweredByItem href="https://www.alphavantage.co" target="_blank" rel="noopener noreferrer">
                                <TrendingUp size={16} />
                                Alpha Vantage
                            </PoweredByItem>
                            <PoweredByItem href="https://finance.yahoo.com" target="_blank" rel="noopener noreferrer">
                                <TrendingUp size={16} />
                                Yahoo Finance
                            </PoweredByItem>
                            <PoweredByItem href="https://stripe.com" target="_blank" rel="noopener noreferrer">
                                <Zap size={16} />
                                Stripe
                            </PoweredByItem>
                            <PoweredByItem href="https://plaid.com" target="_blank" rel="noopener noreferrer">
                                <Shield size={16} />
                                Plaid
                            </PoweredByItem>
                            <PoweredByItem href="https://sendgrid.com" target="_blank" rel="noopener noreferrer">
                                <Send size={16} />
                                SendGrid
                            </PoweredByItem>
                            <PoweredByItem href="https://twilio.com" target="_blank" rel="noopener noreferrer">
                                <MessageSquare size={16} />
                                Twilio
                            </PoweredByItem>
                            <PoweredByItem href="https://cloudinary.com" target="_blank" rel="noopener noreferrer">
                                <Cloud size={16} />
                                Cloudinary
                            </PoweredByItem>
                            <PoweredByItem href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer">
                                <Coins size={16} />
                                CoinGecko
                            </PoweredByItem>
                        </PoweredByGrid>
                    </PoweredByContainer>
                </PoweredBySection>

                <Footer><FooterText>© {new Date().getFullYear()} Nexus Signal. All rights reserved. • Paper trading only — not financial advice.</FooterText></Footer>
            </ContentWrapper>
        </LandingContainer>
    );
};

export default LandingPage;