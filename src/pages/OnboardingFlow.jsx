// client/src/pages/OnboardingFlow.jsx - 🚀 LEGENDARY ONBOARDING EXPERIENCE 🚀

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    Rocket, Sparkles, User, Camera, Upload, Check, ChevronRight,
    ChevronLeft, TrendingUp, TrendingDown, Target, DollarSign,
    BarChart2, Bitcoin, Briefcase, Zap, Crown, Star, Award,
    Users, UserPlus, ArrowRight, Play, Flame, Diamond, Clock,
    PieChart, Activity, Globe, Smartphone, Monitor, Coffee,
    Sun, Moon, Sunrise, LineChart, CandlestickChart, Wallet,
    Coins, Gem, Trophy, Medal, Gift, PartyPopper, X, Heart,
    ThumbsUp, Eye, BookOpen, GraduationCap, Lightbulb
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
`;

const fadeInDown = keyframes`
    from { opacity: 0; transform: translateY(-40px); }
    to { opacity: 1; transform: translateY(0); }
`;

const fadeInScale = keyframes`
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
`;

const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-100px); }
    to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(2deg); }
    75% { transform: translateY(10px) rotate(-2deg); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.4); }
    50% { box-shadow: 0 0 60px rgba(0, 173, 237, 0.8), 0 0 100px rgba(0, 255, 136, 0.4); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
`;

const confetti = keyframes`
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(1000px) rotate(720deg); opacity: 0; }
`;

const typewriter = keyframes`
    from { width: 0; }
    to { width: 100%; }
`;

const blink = keyframes`
    0%, 50% { border-color: transparent; }
    51%, 100% { border-color: #00adef; }
`;

const orbit = keyframes`
    from { transform: rotate(0deg) translateX(150px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
`;

const gradientFlow = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    background: linear-gradient(145deg, #050816 0%, #0a0e27 30%, #1a1f3a 70%, #0a0e27 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
`;

const BackgroundOrbs = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
`;

const Orb = styled.div`
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
    animation: ${float} ${props => props.duration || '20s'} ease-in-out infinite;

    &:nth-child(1) {
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, rgba(0, 173, 237, 0.3) 0%, transparent 70%);
        top: -200px;
        left: -200px;
    }

    &:nth-child(2) {
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
        bottom: -150px;
        right: -150px;
        animation-delay: -5s;
    }

    &:nth-child(3) {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation-delay: -10s;
    }
`;

const ParticleField = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
`;

const Particle = styled.div`
    position: absolute;
    width: ${props => props.size || 4}px;
    height: ${props => props.size || 4}px;
    background: ${props => props.color || '#00adef'};
    border-radius: 50%;
    opacity: ${props => props.opacity || 0.5};
    animation: ${float} ${props => props.duration || '15s'} ease-in-out infinite;
    animation-delay: ${props => props.delay || '0s'};
    top: ${props => props.top};
    left: ${props => props.left};
`;

const OnboardingCard = styled.div`
    width: 100%;
    max-width: 700px;
    background: linear-gradient(145deg, rgba(20, 27, 45, 0.95) 0%, rgba(10, 14, 39, 0.98) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 24px;
    padding: 3rem;
    position: relative;
    animation: ${fadeInScale} 0.6s ease-out;
    box-shadow: 
        0 25px 80px rgba(0, 0, 0, 0.5),
        0 0 1px rgba(0, 173, 237, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);

    @media (max-width: 768px) {
        padding: 2rem;
        margin: 1rem;
    }
`;

const ProgressContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(0, 173, 237, 0.1);
    border-radius: 24px 24px 0 0;
    overflow: hidden;
`;

const ProgressBar = styled.div`
    height: 100%;
    background: linear-gradient(90deg, #00adef, #00ff88, #00adef);
    background-size: 200% 100%;
    animation: ${gradientFlow} 3s ease infinite;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    width: ${props => props.progress}%;
`;

const StepIndicator = styled.div`
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 2.5rem;
`;

const StepDot = styled.div`
    width: ${props => props.$active ? '32px' : '10px'};
    height: 10px;
    border-radius: 5px;
    background: ${props => props.$completed ? 
        'linear-gradient(90deg, #00adef, #00ff88)' : 
        props.$active ? 
        'linear-gradient(90deg, #00adef, #00ff88)' : 
        'rgba(100, 116, 139, 0.3)'
    };
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;

    ${props => props.$active && css`
        animation: ${pulse} 2s ease-in-out infinite;
    `}

    &:hover {
        transform: scale(1.2);
    }
`;

const SkipButton = styled.button`
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    background: transparent;
    border: none;
    color: #64748b;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
        color: #94a3b8;
        background: rgba(100, 116, 139, 0.1);
    }
`;

// ============ STEP CONTENT COMPONENTS ============
const StepContent = styled.div`
    animation: ${fadeInUp} 0.5s ease-out;
    min-height: 400px;
    display: flex;
    flex-direction: column;
`;

const StepTitle = styled.h1`
    font-size: 2.2rem;
    font-weight: 900;
    text-align: center;
    margin-bottom: 0.75rem;
    background: linear-gradient(135deg, #ffffff 0%, #00adef 50%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (max-width: 768px) {
        font-size: 1.8rem;
    }
`;

const StepSubtitle = styled.p`
    text-align: center;
    color: #94a3b8;
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
    line-height: 1.6;
`;

// ============ WELCOME STEP ============
const WelcomeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex: 1;
`;

const LogoContainer = styled.div`
    position: relative;
    margin-bottom: 2rem;
`;

const Logo = styled.div`
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${glow} 3s ease-in-out infinite, ${float} 6s ease-in-out infinite;
    position: relative;
    z-index: 2;

    svg {
        color: white;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }
`;

const OrbitingIcon = styled.div`
    position: absolute;
    animation: ${orbit} ${props => props.duration || '10s'} linear infinite;
    animation-delay: ${props => props.delay || '0s'};

    svg {
        color: ${props => props.color || '#00adef'};
        opacity: 0.7;
    }
`;

const WelcomeTitle = styled.h1`
    font-size: 3rem;
    font-weight: 900;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #ffffff 0%, #00adef 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    @media (max-width: 768px) {
        font-size: 2.2rem;
    }
`;

const WelcomeSubtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    max-width: 450px;
    line-height: 1.7;
    margin-bottom: 2rem;
`;

const FeatureList = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const FeatureTag = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 20px;
    color: #00adef;
    font-size: 0.9rem;
    font-weight: 600;
    animation: ${fadeInUp} 0.5s ease-out backwards;
    animation-delay: ${props => props.delay || '0s'};

    svg {
        width: 16px;
        height: 16px;
    }
`;

// ============ PROFILE SETUP ============
const ProfileSetupContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const AvatarUploadArea = styled.div`
    position: relative;
    margin-bottom: 2rem;
`;

const AvatarPreview = styled.div`
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: ${props => props.$hasImage ? 'transparent' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'};
    border: 3px solid ${props => props.$hasImage ? '#00adef' : 'rgba(100, 116, 139, 0.3)'};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;

    &:hover {
        border-color: #00adef;
        transform: scale(1.05);
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const AvatarPlaceholder = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;

    svg {
        width: 40px;
        height: 40px;
    }

    span {
        font-size: 0.85rem;
    }
`;

const AvatarUploadButton = styled.label`
    position: absolute;
    bottom: 0;
    right: 0;
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    border: 3px solid #0a0e27;
    transition: all 0.3s ease;
    z-index: 10;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 20px rgba(0, 173, 237, 0.5);
    }

    input {
        display: none;
    }
`;

const FormGrid = styled.div`
    display: grid;
    gap: 1.5rem;
    width: 100%;
    max-width: 400px;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Input = styled.input`
    padding: 1rem 1.25rem;
    background: rgba(15, 23, 42, 0.8);
    border: 2px solid rgba(100, 116, 139, 0.2);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.05);
        box-shadow: 0 0 0 4px rgba(0, 173, 237, 0.1);
    }

    &::placeholder {
        color: #475569;
    }
`;

const TextArea = styled.textarea`
    padding: 1rem 1.25rem;
    background: rgba(15, 23, 42, 0.8);
    border: 2px solid rgba(100, 116, 139, 0.2);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    font-family: inherit;
    resize: none;
    min-height: 100px;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.05);
        box-shadow: 0 0 0 4px rgba(0, 173, 237, 0.1);
    }

    &::placeholder {
        color: #475569;
    }
`;

const CharCount = styled.span`
    font-size: 0.8rem;
    color: ${props => props.$over ? '#ef4444' : '#64748b'};
    text-align: right;
`;

// ============ INTERESTS SELECTION ============
const InterestsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
    width: 100%;
`;

const InterestCard = styled.button`
    padding: 1.25rem;
    background: ${props => props.$selected ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 255, 136, 0.1) 100%)' : 
        'rgba(15, 23, 42, 0.6)'
    };
    border: 2px solid ${props => props.$selected ? '#00adef' : 'rgba(100, 116, 139, 0.2)'};
    border-radius: 16px;
    color: ${props => props.$selected ? '#00adef' : '#94a3b8'};
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    overflow: hidden;

    &:hover {
        border-color: #00adef;
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0, 173, 237, 0.2);
    }

    ${props => props.$selected && css`
        animation: ${pulse} 0.3s ease-out;
    `}

    svg {
        width: 28px;
        height: 28px;
        transition: all 0.3s ease;
    }

    span {
        font-weight: 600;
        font-size: 0.9rem;
    }
`;

const CheckBadge = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${fadeInScale} 0.3s ease-out;

    svg {
        width: 12px;
        height: 12px;
        color: white;
    }
`;

const SelectionCount = styled.div`
    text-align: center;
    color: #64748b;
    font-size: 0.9rem;
    margin-top: 1rem;

    span {
        color: #00adef;
        font-weight: 700;
    }
`;

// ============ FOLLOW TRADERS ============
const TradersGrid = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-height: 350px;
    overflow-y: auto;
    padding-right: 0.5rem;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(100, 116, 139, 0.1);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.3);
        border-radius: 3px;
    }
`;

const TraderCard = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: ${props => props.$selected ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.15) 0%, rgba(0, 255, 136, 0.05) 100%)' : 
        'rgba(15, 23, 42, 0.6)'
    };
    border: 2px solid ${props => props.$selected ? '#00adef' : 'rgba(100, 116, 139, 0.2)'};
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        border-color: ${props => props.$selected ? '#00adef' : 'rgba(0, 173, 237, 0.5)'};
        transform: translateX(4px);
    }
`;

const TraderAvatar = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 900;
    color: white;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const TraderRank = styled.div`
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 22px;
    height: 22px;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #cd7f32 0%, #daa06d 100%)';
        return 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)';
    }};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 900;
    color: ${props => props.$rank <= 3 ? '#000' : '#fff'};
    border: 2px solid #0a0e27;
`;

const TraderInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const TraderName = styled.div`
    font-weight: 700;
    color: #e0e6ed;
    font-size: 1rem;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const VerifiedBadge = styled.span`
    color: #00adef;
`;

const TraderStats = styled.div`
    display: flex;
    gap: 1rem;
    font-size: 0.85rem;
    color: #64748b;
`;

const TraderStat = styled.span`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: ${props => props.$positive ? '#10b981' : props.$negative ? '#ef4444' : '#64748b'};

    svg {
        width: 14px;
        height: 14px;
    }
`;

const FollowButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$following ? 
        'transparent' : 
        'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'
    };
    border: 2px solid ${props => props.$following ? '#00adef' : 'transparent'};
    border-radius: 20px;
    color: ${props => props.$following ? '#00adef' : 'white'};
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(0, 173, 237, 0.3);
    }

    svg {
        width: 16px;
        height: 16px;
    }
`;

// ============ FIRST PREDICTION ============
const PredictionContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

const StockCard = styled.div`
    width: 100%;
    max-width: 400px;
    background: rgba(15, 23, 42, 0.8);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
`;

const StockHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const StockLogo = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: ${props => props.$color || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
`;

const StockInfo = styled.div`
    flex: 1;
`;

const StockSymbol = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: #e0e6ed;
`;

const StockName = styled.div`
    color: #64748b;
    font-size: 0.9rem;
`;

const StockPrice = styled.div`
    text-align: right;
`;

const PriceValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: #e0e6ed;
`;

const PriceChange = styled.div`
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.25rem;
`;

const PredictionQuestion = styled.div`
    text-align: center;
    color: #94a3b8;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
`;

const PredictionButtons = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
`;

const PredictionButton = styled.button`
    padding: 1.25rem;
    background: ${props => {
        if (props.$selected && props.$direction === 'up') return 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)';
        if (props.$selected && props.$direction === 'down') return 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)';
        return 'rgba(15, 23, 42, 0.6)';
    }};
    border: 2px solid ${props => {
        if (props.$selected && props.$direction === 'up') return '#10b981';
        if (props.$selected && props.$direction === 'down') return '#ef4444';
        return 'rgba(100, 116, 139, 0.2)';
    }};
    border-radius: 16px;
    color: ${props => {
        if (props.$direction === 'up') return props.$selected ? '#10b981' : '#64748b';
        return props.$selected ? '#ef4444' : '#64748b';
    }};
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;

    &:hover {
        border-color: ${props => props.$direction === 'up' ? '#10b981' : '#ef4444'};
        transform: scale(1.02);
    }

    svg {
        width: 32px;
        height: 32px;
    }

    span {
        font-weight: 700;
        font-size: 1.1rem;
    }
`;

const TimeframeSelector = styled.div`
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
`;

const TimeframeButton = styled.button`
    padding: 0.5rem 1rem;
    background: ${props => props.$selected ? 'rgba(0, 173, 237, 0.2)' : 'rgba(15, 23, 42, 0.6)'};
    border: 1px solid ${props => props.$selected ? '#00adef' : 'rgba(100, 116, 139, 0.2)'};
    border-radius: 20px;
    color: ${props => props.$selected ? '#00adef' : '#64748b'};
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
        border-color: #00adef;
    }
`;

// ============ COMPLETION ============
const CompletionContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    flex: 1;
    position: relative;
`;

const ConfettiContainer = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
`;

const ConfettiPiece = styled.div`
    position: absolute;
    width: ${props => props.size || 10}px;
    height: ${props => props.size || 10}px;
    background: ${props => props.color};
    top: -20px;
    left: ${props => props.left}%;
    animation: ${confetti} ${props => props.duration || 3}s ease-out forwards;
    animation-delay: ${props => props.delay || 0}s;
    transform: rotate(${props => props.rotation || 0}deg);
    border-radius: ${props => props.shape === 'circle' ? '50%' : '0'};
`;

const TrophyContainer = styled.div`
    margin-bottom: 2rem;
    position: relative;
`;

const TrophyIcon = styled.div`
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${bounce} 2s ease-in-out infinite, ${glow} 2s ease-in-out infinite;
    box-shadow: 0 0 60px rgba(255, 215, 0, 0.5);

    svg {
        color: #0a0e27;
        width: 60px;
        height: 60px;
    }
`;

const AchievementUnlocked = styled.div`
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%);
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 16px;
    padding: 1.25rem 2rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: ${fadeInScale} 0.5s ease-out 0.5s backwards;
`;

const AchievementIcon = styled.div`
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #ffd700 0%, #f59e0b 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
`;

const AchievementInfo = styled.div`
    text-align: left;
`;

const AchievementLabel = styled.div`
    color: #ffd700;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const AchievementTitle = styled.div`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 700;
`;

const XPReward = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
    animation: ${fadeInScale} 0.5s ease-out 0.7s backwards;

    svg {
        color: #a78bfa;
    }
`;

const XPAmount = styled.span`
    color: #a78bfa;
    font-size: 1.5rem;
    font-weight: 900;
`;

const XPLabel = styled.span`
    color: #94a3b8;
    font-size: 0.9rem;
`;

// ============ NAVIGATION BUTTONS ============
const NavigationButtons = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
    padding-top: 2rem;
    gap: 1rem;
`;

const NavButton = styled.button`
    padding: 0.875rem 1.75rem;
    background: ${props => props.$primary ? 
        'linear-gradient(135deg, #00adef 0%, #00ff88 100%)' : 
        'rgba(100, 116, 139, 0.1)'
    };
    border: ${props => props.$primary ? 'none' : '1px solid rgba(100, 116, 139, 0.2)'};
    border-radius: 12px;
    color: ${props => props.$primary ? '#0a0e27' : '#94a3b8'};
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    min-width: 120px;
    justify-content: center;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: ${props => props.$primary ? 
            '0 8px 30px rgba(0, 173, 237, 0.4)' : 
            '0 4px 20px rgba(100, 116, 139, 0.2)'
        };
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

const Spacer = styled.div`
    flex: 1;
`;

// ============ LOADING SPINNER ============
const LoadingSpinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 173, 237, 0.2);
    border-top-color: #00adef;
    border-radius: 50%;
    animation: ${rotate} 1s linear infinite;
    margin: 2rem auto;
`;

// ============ INTERESTS DATA ============
const INTERESTS = [
    { id: 'stocks', name: 'Stocks', icon: LineChart, color: '#00adef' },
    { id: 'crypto', name: 'Crypto', icon: Bitcoin, color: '#f7931a' },
    { id: 'options', name: 'Options', icon: CandlestickChart, color: '#8b5cf6' },
    { id: 'daytrading', name: 'Day Trading', icon: Zap, color: '#fbbf24' },
    { id: 'swing', name: 'Swing Trading', icon: Activity, color: '#10b981' },
    { id: 'longterm', name: 'Long-term', icon: PieChart, color: '#06b6d4' },
    { id: 'dividends', name: 'Dividends', icon: Coins, color: '#22c55e' },
    { id: 'forex', name: 'Forex', icon: Globe, color: '#3b82f6' },
    { id: 'etfs', name: 'ETFs', icon: Briefcase, color: '#ec4899' },
    { id: 'tech', name: 'Tech Stocks', icon: Monitor, color: '#6366f1' },
    { id: 'energy', name: 'Energy', icon: Flame, color: '#f97316' },
    { id: 'growth', name: 'Growth', icon: Rocket, color: '#14b8a6' },
];

// ============ FEATURED STOCK FOR PREDICTION ============
const FEATURED_STOCK = {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.28,
    change: 2.34,
    changePercent: 0.27,
    logo: '🎮',
    color: 'linear-gradient(135deg, #76b900 0%, #5a8f00 100%)'
};

// ============ CONFETTI COLORS ============
const CONFETTI_COLORS = ['#00adef', '#00ff88', '#ffd700', '#ff6b6b', '#a78bfa', '#f97316', '#ec4899'];

// ============ MAIN COMPONENT ============
const OnboardingFlow = () => {
    const navigate = useNavigate();
    const { user, api } = useAuth();
    const toast = useToast();
    
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Step 2: Profile
    const [profileData, setProfileData] = useState({
        displayName: '',
        bio: '',
        avatar: null,
        avatarPreview: ''
    });
    
    // Step 3: Interests
    const [selectedInterests, setSelectedInterests] = useState([]);
    
    // Step 4: Follow traders
    const [topTraders, setTopTraders] = useState([]);
    const [followedTraders, setFollowedTraders] = useState([]);
    const [loadingTraders, setLoadingTraders] = useState(false);
    
    // Step 5: Prediction
    const [prediction, setPrediction] = useState({
        direction: null,
        timeframe: '1d'
    });
    
    // Confetti state
    const [showConfetti, setShowConfetti] = useState(false);

    const totalSteps = 6;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    // Initialize user data
    useEffect(() => {
        if (user) {
            setProfileData(prev => ({
                ...prev,
                displayName: user.profile?.displayName || user.name || '',
                bio: user.bio || '',
                avatarPreview: user.profile?.avatar || ''
            }));
        }
    }, [user]);

    // Fetch top traders when reaching step 4
    useEffect(() => {
        if (currentStep === 3) {
            fetchTopTraders();
        }
    }, [currentStep]);

    // Trigger confetti on completion
    useEffect(() => {
        if (currentStep === 5) {
            setShowConfetti(true);
            // Award achievement
            awardWelcomeAchievement();
        }
    }, [currentStep]);

    const fetchTopTraders = async () => {
        setLoadingTraders(true);
        try {
            const res = await api.get('/social/leaderboard?sortBy=totalReturnPercent&limit=10');
            if (res.data) {
                setTopTraders(res.data.map((t, index) => ({
                    id: t.userId,
                    name: t.displayName || t.username,
                    avatar: t.avatar,
                    rank: index + 1,
                    return: t.stats?.totalReturnPercent || 0,
                    winRate: t.stats?.winRate || 0,
                    followers: t.social?.followersCount || 0,
                    verified: t.badges?.includes('verified')
                })));
            }
        } catch (error) {
            console.error('Error fetching traders:', error);
            // Use mock data as fallback
            setTopTraders([
                { id: '1', name: 'TradeMaster', rank: 1, return: 156.4, winRate: 78, followers: 12500, verified: true },
                { id: '2', name: 'CryptoKing', rank: 2, return: 142.8, winRate: 72, followers: 9800, verified: true },
                { id: '3', name: 'WallStreetWolf', rank: 3, return: 128.3, winRate: 69, followers: 8200, verified: false },
                { id: '4', name: 'AlphaTrader', rank: 4, return: 115.7, winRate: 71, followers: 6500, verified: true },
                { id: '5', name: 'BullRunner', rank: 5, return: 98.2, winRate: 65, followers: 5100, verified: false },
            ]);
        } finally {
            setLoadingTraders(false);
        }
    };

    const awardWelcomeAchievement = async () => {
        try {
            await api.post('/gamification/achievement', {
                achievementId: 'welcome_aboard',
                xpReward: 100
            });
        } catch (error) {
            console.error('Error awarding achievement:', error);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB');
                return;
            }
            setProfileData(prev => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, avatarPreview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleInterest = (id) => {
        setSelectedInterests(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const toggleFollowTrader = (traderId) => {
        setFollowedTraders(prev =>
            prev.includes(traderId)
                ? prev.filter(id => id !== traderId)
                : [...prev, traderId]
        );
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return true; // Welcome
            case 1: return profileData.displayName.trim().length >= 2; // Profile
            case 2: return selectedInterests.length >= 1; // Interests
            case 3: return followedTraders.length >= 1; // Follow traders
            case 4: return prediction.direction !== null; // Prediction
            case 5: return true; // Complete
            default: return true;
        }
    };

    const handleNext = async () => {
        if (!canProceed()) return;

        // Save data on certain steps
        if (currentStep === 1) {
            await saveProfile();
        } else if (currentStep === 2) {
            await saveInterests();
        } else if (currentStep === 3) {
            await followSelectedTraders();
        } else if (currentStep === 4) {
            await submitPrediction();
        }

        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = async () => {
        await completeOnboarding();
        navigate('/dashboard');
    };

    const handleComplete = async () => {
        await completeOnboarding();
        toast.success('Welcome to Nexus Signal! 🚀', 'Let\'s Go!');
        navigate('/dashboard');
    };

    const saveProfile = async () => {
        try {
            // Upload avatar if changed
            if (profileData.avatar) {
                const formData = new FormData();
                formData.append('avatar', profileData.avatar);
                await api.post('/auth/upload-avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Save profile data
            await api.put('/auth/profile', {
                displayName: profileData.displayName,
                bio: profileData.bio
            });
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    const saveInterests = async () => {
        try {
            await api.put('/auth/preferences', {
                interests: selectedInterests
            });
        } catch (error) {
            console.error('Error saving interests:', error);
        }
    };

    const followSelectedTraders = async () => {
        try {
            for (const traderId of followedTraders) {
                await api.post(`/social/follow/${traderId}`);
            }
        } catch (error) {
            console.error('Error following traders:', error);
        }
    };

    const submitPrediction = async () => {
        try {
            await api.post('/predictions', {
                symbol: FEATURED_STOCK.symbol,
                direction: prediction.direction === 'up' ? 'UP' : 'DOWN',
                timeframe: prediction.timeframe,
                confidence: 70
            });
        } catch (error) {
            console.error('Error submitting prediction:', error);
        }
    };

    const completeOnboarding = async () => {
        try {
            await api.put('/auth/onboarding-complete', {
                completedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    // Generate confetti pieces
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 10,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        shape: Math.random() > 0.5 ? 'circle' : 'square'
    }));

    // Generate particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 4,
        color: ['#00adef', '#00ff88', '#a78bfa'][Math.floor(Math.random() * 3)],
        opacity: 0.3 + Math.random() * 0.4,
        duration: `${10 + Math.random() * 20}s`,
        delay: `${Math.random() * 10}s`
    }));

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <WelcomeContainer>
                        <LogoContainer>
                            <Logo>
                                <Rocket size={56} />
                            </Logo>
                            <OrbitingIcon duration="12s" delay="0s" color="#00adef">
                                <TrendingUp size={24} />
                            </OrbitingIcon>
                            <OrbitingIcon duration="12s" delay="-4s" color="#10b981">
                                <DollarSign size={24} />
                            </OrbitingIcon>
                            <OrbitingIcon duration="12s" delay="-8s" color="#f59e0b">
                                <Star size={24} />
                            </OrbitingIcon>
                        </LogoContainer>
                        
                        <WelcomeTitle>Welcome to Nexus Signal</WelcomeTitle>
                        <WelcomeSubtitle>
                            Your journey to smarter trading starts here. Track markets, make predictions, 
                            and compete with traders worldwide.
                        </WelcomeSubtitle>

                        <FeatureList>
                            <FeatureTag delay="0.2s"><LineChart /> Real-time Markets</FeatureTag>
                            <FeatureTag delay="0.3s"><Target /> Predictions</FeatureTag>
                            <FeatureTag delay="0.4s"><Users /> Social Trading</FeatureTag>
                            <FeatureTag delay="0.5s"><Trophy /> Leaderboards</FeatureTag>
                            <FeatureTag delay="0.6s"><Gem /> Achievements</FeatureTag>
                        </FeatureList>
                    </WelcomeContainer>
                );

            case 1:
                return (
                    <ProfileSetupContainer>
                        <StepTitle>Set Up Your Profile</StepTitle>
                        <StepSubtitle>Let other traders know who you are</StepSubtitle>

                        <AvatarUploadArea>
                            <AvatarPreview 
                                $hasImage={!!profileData.avatarPreview}
                                onClick={() => document.getElementById('avatar-input').click()}
                            >
                                {profileData.avatarPreview ? (
                                    <img src={profileData.avatarPreview} alt="Avatar" />
                                ) : (
                                    <AvatarPlaceholder>
                                        <Camera />
                                        <span>Add Photo</span>
                                    </AvatarPlaceholder>
                                )}
                            </AvatarPreview>
                            <AvatarUploadButton htmlFor="avatar-input">
                                <Upload size={20} />
                                <input
                                    type="file"
                                    id="avatar-input"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </AvatarUploadButton>
                        </AvatarUploadArea>

                        <FormGrid>
                            <FormGroup>
                                <Label><User size={16} /> Display Name *</Label>
                                <Input
                                    type="text"
                                    placeholder="How should we call you?"
                                    value={profileData.displayName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                                    maxLength={30}
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label><BookOpen size={16} /> Bio (optional)</Label>
                                <TextArea
                                    placeholder="Tell us about your trading style..."
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                                    maxLength={160}
                                />
                                <CharCount $over={profileData.bio.length > 160}>
                                    {profileData.bio.length}/160
                                </CharCount>
                            </FormGroup>
                        </FormGrid>
                    </ProfileSetupContainer>
                );

            case 2:
                return (
                    <StepContent>
                        <StepTitle>What Are You Interested In?</StepTitle>
                        <StepSubtitle>Select your trading interests to personalize your feed</StepSubtitle>

                        <InterestsGrid>
                            {INTERESTS.map(interest => {
                                const Icon = interest.icon;
                                const isSelected = selectedInterests.includes(interest.id);
                                return (
                                    <InterestCard
                                        key={interest.id}
                                        $selected={isSelected}
                                        onClick={() => toggleInterest(interest.id)}
                                    >
                                        {isSelected && (
                                            <CheckBadge>
                                                <Check />
                                            </CheckBadge>
                                        )}
                                        <Icon style={{ color: isSelected ? interest.color : undefined }} />
                                        <span>{interest.name}</span>
                                    </InterestCard>
                                );
                            })}
                        </InterestsGrid>

                        <SelectionCount>
                            <span>{selectedInterests.length}</span> selected (minimum 1)
                        </SelectionCount>
                    </StepContent>
                );

            case 3:
                return (
                    <StepContent>
                        <StepTitle>Follow Top Traders</StepTitle>
                        <StepSubtitle>Learn from the best and see their trades in your feed</StepSubtitle>

                        {loadingTraders ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <TradersGrid>
                                    {topTraders.map(trader => (
                                        <TraderCard
                                            key={trader.id}
                                            $selected={followedTraders.includes(trader.id)}
                                            onClick={() => toggleFollowTrader(trader.id)}
                                        >
                                            <TraderAvatar>
                                                {trader.avatar ? (
                                                    <img src={trader.avatar} alt={trader.name} />
                                                ) : (
                                                    getInitials(trader.name)
                                                )}
                                                <TraderRank $rank={trader.rank}>
                                                    {trader.rank}
                                                </TraderRank>
                                            </TraderAvatar>
                                            
                                            <TraderInfo>
                                                <TraderName>
                                                    {trader.name}
                                                    {trader.verified && (
                                                        <VerifiedBadge>✓</VerifiedBadge>
                                                    )}
                                                </TraderName>
                                                <TraderStats>
                                                    <TraderStat $positive>
                                                        <TrendingUp /> +{trader.return?.toFixed(1)}%
                                                    </TraderStat>
                                                    <TraderStat>
                                                        <Target /> {trader.winRate}% win
                                                    </TraderStat>
                                                    <TraderStat>
                                                        <Users /> {trader.followers?.toLocaleString()}
                                                    </TraderStat>
                                                </TraderStats>
                                            </TraderInfo>

                                            <FollowButton
                                                $following={followedTraders.includes(trader.id)}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFollowTrader(trader.id);
                                                }}
                                            >
                                                {followedTraders.includes(trader.id) ? (
                                                    <>
                                                        <Check /> Following
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus /> Follow
                                                    </>
                                                )}
                                            </FollowButton>
                                        </TraderCard>
                                    ))}
                                </TradersGrid>

                                <SelectionCount>
                                    Following <span>{followedTraders.length}</span> traders (minimum 1)
                                </SelectionCount>
                            </>
                        )}
                    </StepContent>
                );

            case 4:
                return (
                    <PredictionContainer>
                        <StepTitle>Make Your First Prediction</StepTitle>
                        <StepSubtitle>Will this stock go up or down?</StepSubtitle>

                        <StockCard>
                            <StockHeader>
                                <StockLogo $color={FEATURED_STOCK.color}>
                                    {FEATURED_STOCK.logo}
                                </StockLogo>
                                <StockInfo>
                                    <StockSymbol>${FEATURED_STOCK.symbol}</StockSymbol>
                                    <StockName>{FEATURED_STOCK.name}</StockName>
                                </StockInfo>
                                <StockPrice>
                                    <PriceValue>${FEATURED_STOCK.price.toFixed(2)}</PriceValue>
                                    <PriceChange $positive={FEATURED_STOCK.change >= 0}>
                                        {FEATURED_STOCK.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {FEATURED_STOCK.change >= 0 ? '+' : ''}{FEATURED_STOCK.changePercent.toFixed(2)}%
                                    </PriceChange>
                                </StockPrice>
                            </StockHeader>
                        </StockCard>

                        <PredictionQuestion>
                            Where do you think ${FEATURED_STOCK.symbol} will go?
                        </PredictionQuestion>

                        <PredictionButtons>
                            <PredictionButton
                                $direction="up"
                                $selected={prediction.direction === 'up'}
                                onClick={() => setPrediction(prev => ({ ...prev, direction: 'up' }))}
                            >
                                <TrendingUp />
                                <span>Bullish 🚀</span>
                            </PredictionButton>
                            <PredictionButton
                                $direction="down"
                                $selected={prediction.direction === 'down'}
                                onClick={() => setPrediction(prev => ({ ...prev, direction: 'down' }))}
                            >
                                <TrendingDown />
                                <span>Bearish 🐻</span>
                            </PredictionButton>
                        </PredictionButtons>

                        <TimeframeSelector>
                            {['1d', '1w', '1m'].map(tf => (
                                <TimeframeButton
                                    key={tf}
                                    $selected={prediction.timeframe === tf}
                                    onClick={() => setPrediction(prev => ({ ...prev, timeframe: tf }))}
                                >
                                    {tf === '1d' ? '24 Hours' : tf === '1w' ? '1 Week' : '1 Month'}
                                </TimeframeButton>
                            ))}
                        </TimeframeSelector>
                    </PredictionContainer>
                );

            case 5:
                return (
                    <CompletionContainer>
                        {showConfetti && (
                            <ConfettiContainer>
                                {confettiPieces.map(piece => (
                                    <ConfettiPiece
                                        key={piece.id}
                                        left={piece.left}
                                        color={piece.color}
                                        size={piece.size}
                                        duration={piece.duration}
                                        delay={piece.delay}
                                        rotation={piece.rotation}
                                        shape={piece.shape}
                                    />
                                ))}
                            </ConfettiContainer>
                        )}

                        <TrophyContainer>
                            <TrophyIcon>
                                <Trophy />
                            </TrophyIcon>
                        </TrophyContainer>

                        <StepTitle>You're All Set!</StepTitle>
                        <StepSubtitle>
                            Welcome to the Nexus Signal community. Start exploring, making predictions, 
                            and climbing the leaderboard!
                        </StepSubtitle>

                        <AchievementUnlocked>
                            <AchievementIcon>🎉</AchievementIcon>
                            <AchievementInfo>
                                <AchievementLabel>Achievement Unlocked</AchievementLabel>
                                <AchievementTitle>Welcome Aboard!</AchievementTitle>
                            </AchievementInfo>
                        </AchievementUnlocked>

                        <XPReward>
                            <Sparkles size={24} />
                            <XPAmount>+100</XPAmount>
                            <XPLabel>XP Earned</XPLabel>
                        </XPReward>
                    </CompletionContainer>
                );

            default:
                return null;
        }
    };

    return (
        <PageContainer>
            <BackgroundOrbs>
                <Orb />
                <Orb />
                <Orb />
            </BackgroundOrbs>

            <ParticleField>
                {particles.map(p => (
                    <Particle
                        key={p.id}
                        top={p.top}
                        left={p.left}
                        size={p.size}
                        color={p.color}
                        opacity={p.opacity}
                        duration={p.duration}
                        delay={p.delay}
                    />
                ))}
            </ParticleField>

            <OnboardingCard>
                <ProgressContainer>
                    <ProgressBar progress={progress} />
                </ProgressContainer>

                {currentStep > 0 && currentStep < 5 && (
                    <SkipButton onClick={handleSkip}>
                        Skip for now <ChevronRight size={16} />
                    </SkipButton>
                )}

                <StepIndicator>
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <StepDot
                            key={index}
                            $active={index === currentStep}
                            $completed={index < currentStep}
                            onClick={() => index < currentStep && setCurrentStep(index)}
                        />
                    ))}
                </StepIndicator>

                {renderStep()}

                <NavigationButtons>
                    {currentStep > 0 && currentStep < 5 ? (
                        <NavButton onClick={handleBack}>
                            <ChevronLeft /> Back
                        </NavButton>
                    ) : (
                        <Spacer />
                    )}

                    {currentStep < 5 ? (
                        <NavButton 
                            $primary 
                            onClick={handleNext}
                            disabled={!canProceed()}
                        >
                            {currentStep === 0 ? 'Get Started' : 'Continue'} <ChevronRight />
                        </NavButton>
                    ) : (
                        <NavButton $primary onClick={handleComplete}>
                            Go to Dashboard <Rocket />
                        </NavButton>
                    )}
                </NavigationButtons>
            </OnboardingCard>
        </PageContainer>
    );
};

export default OnboardingFlow;