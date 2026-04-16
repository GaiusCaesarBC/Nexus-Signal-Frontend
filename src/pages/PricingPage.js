// client/src/pages/PricingPage.js - UPDATED FEATURES ✨
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
    Check, Zap, Crown, Star, Rocket, Sparkles, TrendingUp, Shield, Award, Gift,
    Brain, Lock, Infinity, ArrowRight, CheckCircle
} from 'lucide-react';
import nexusSignalLogo from '../assets/nexus-signal-logo.png';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';

// ============ ANIMATIONS (keeping all your existing animations) ============
const fadeInUp = keyframes`
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
`;

const fadeInDown = keyframes`
    from { opacity: 0; transform: translateY(-40px); }
    to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(1deg); }
    75% { transform: translateY(-5px) rotate(-1deg); }
`;

const megaGlow = keyframes`
    0%, 100% { 
        box-shadow: 
            0 0 20px rgba(59, 130, 246, 0.3),
            0 0 40px rgba(139, 92, 246, 0.2),
            0 0 60px rgba(249, 115, 22, 0.1);
    }
    50% { 
        box-shadow: 
            0 0 40px rgba(59, 130, 246, 0.5),
            0 0 80px rgba(139, 92, 246, 0.3),
            0 0 120px rgba(249, 115, 22, 0.2);
    }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.9; }
`;

const pulseGlow = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px currentColor;
        opacity: 0.8;
    }
    50% { 
        box-shadow: 0 0 40px currentColor, 0 0 60px currentColor;
        opacity: 1;
    }
`;

const gradientShift = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const floatingOrb = keyframes`
    0%, 100% { 
        transform: translate(0, 0) scale(1);
        opacity: 0.6;
    }
    25% { 
        transform: translate(20px, -30px) scale(1.1);
        opacity: 0.8;
    }
    50% { 
        transform: translate(-10px, -50px) scale(0.9);
        opacity: 0.5;
    }
    75% { 
        transform: translate(-30px, -20px) scale(1.05);
        opacity: 0.7;
    }
`;

const shootingStar = keyframes`
    0% { transform: translateX(0) translateY(0); opacity: 1; }
    70% { opacity: 1; }
    100% { transform: translateX(300px) translateY(300px); opacity: 0; }
`;

const aurora = keyframes`
    0% { 
        transform: translateX(-50%) rotate(0deg);
        opacity: 0.3;
    }
    50% { 
        opacity: 0.5;
    }
    100% { 
        transform: translateX(-50%) rotate(360deg);
        opacity: 0.3;
    }
`;

const ripple = keyframes`
    0% { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(4); opacity: 0; }
`;

const countUp = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

// ============ STYLED COMPONENTS (keeping all your existing styles) ============
const PricingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding-top: 100px;
    background: #030712;
    color: #f8fafc;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    padding-bottom: 6rem;
    position: relative;
    overflow: visible;
`;

const CosmicBackground = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
    background: 
        radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(249, 115, 22, 0.05) 0%, transparent 70%),
        linear-gradient(180deg, #030712 0%, #0f172a 50%, #030712 100%);
`;

const StarField = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
`;

const StarLayer = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: ${props => props.$stars};
    background-size: ${props => props.$size}px ${props => props.$size}px;
    animation: ${props => css`
        ${keyframes`
            from { transform: translateY(0); }
            to { transform: translateY(${props.$size}px); }
        `}
    `} ${props => props.$duration}s linear infinite;
    opacity: ${props => props.$opacity};
`;

const AuroraEffect = styled.div`
    position: absolute;
    top: -50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
        from 0deg,
        transparent 0deg,
        rgba(59, 130, 246, 0.1) 60deg,
        rgba(139, 92, 246, 0.1) 120deg,
        transparent 180deg,
        rgba(249, 115, 22, 0.05) 240deg,
        rgba(16, 185, 129, 0.05) 300deg,
        transparent 360deg
    );
    animation: ${aurora} 60s linear infinite;
    filter: blur(60px);
`;

const GridOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
        linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
`;

const FloatingOrb = styled.div`
    position: absolute;
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    background: radial-gradient(circle, ${props => props.$color} 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(${props => props.$blur}px);
    animation: ${floatingOrb} ${props => props.$duration}s ease-in-out infinite;
    animation-delay: ${props => props.$delay}s;
    top: ${props => props.$top}%;
    left: ${props => props.$left}%;
    opacity: 0.6;
`;

const ShootingStar = styled.div`
    position: absolute;
    width: 100px;
    height: 2px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), transparent);
    animation: ${shootingStar} ${props => props.$duration}s linear infinite;
    animation-delay: ${props => props.$delay}s;
    top: ${props => props.$top}%;
    left: ${props => props.$left}%;
    transform-origin: left center;
    opacity: 0;
`;

const HeaderSection = styled.div`
    text-align: center;
    z-index: 2;
    max-width: 1000px;
    margin-bottom: 3rem;
`;

const LogoContainer = styled.div`
    position: relative;
    display: inline-block;
    margin-bottom: 2rem;
`;

const HeaderLogo = styled.img`
    width: 100px;
    height: 100px;
    animation: ${float} 4s ease-in-out infinite;
    filter: drop-shadow(0 0 30px rgba(59, 130, 246, 0.8));
    cursor: pointer;
    transition: all 0.4s ease;
    position: relative;
    z-index: 2;

    &:hover {
        transform: scale(1.15) rotate(10deg);
        filter: drop-shadow(0 0 50px rgba(59, 130, 246, 1));
    }
`;

const LogoRing = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140px;
    height: 140px;
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-radius: 50%;
    animation: ${pulseGlow} 3s ease-in-out infinite;
    color: rgba(59, 130, 246, 0.3);

    &::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 50%;
        animation: ${rotate} 20s linear infinite reverse;
    }
`;

const Title = styled.h1`
    font-size: 4rem;
    margin-bottom: 1.5rem;
    color: #f8fafc;
    line-height: 1.1;
    animation: ${fadeInDown} 1s ease-out;
    font-weight: 800;
    letter-spacing: -0.02em;
    
    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const GradientText = styled.span`
    background: linear-gradient(
        135deg, 
        #3b82f6 0%, 
        #8b5cf6 25%, 
        #f97316 50%, 
        #3b82f6 75%, 
        #8b5cf6 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${gradientShift} 5s ease infinite;
`;

const Subtitle = styled.p`
    font-size: 1.4rem;
    color: #94a3b8;
    max-width: 800px;
    margin: 0 auto 2rem;
    line-height: 1.7;
    animation: ${fadeInUp} 1s ease-out 0.2s backwards;

    @media (max-width: 768px) {
        font-size: 1.1rem;
    }
`;

const BillingToggleContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 3rem;
    animation: ${fadeInUp} 1s ease-out 0.4s backwards;
    z-index: 2;
`;

const BillingLabel = styled.span`
    font-size: 1rem;
    color: ${props => props.$active ? '#f8fafc' : '#64748b'};
    font-weight: ${props => props.$active ? '600' : '400'};
    transition: all 0.3s ease;
`;

const ToggleSwitch = styled.div`
    width: 70px;
    height: 36px;
    background: ${props => props.$yearly 
        ? 'linear-gradient(135deg, #10b981, #059669)' 
        : 'linear-gradient(135deg, #3b82f6, #2563eb)'};
    border-radius: 18px;
    cursor: pointer;
    position: relative;
    transition: all 0.4s ease;
    box-shadow: 0 4px 15px ${props => props.$yearly 
        ? 'rgba(16, 185, 129, 0.4)' 
        : 'rgba(59, 130, 246, 0.4)'};

    &::after {
        content: '';
        position: absolute;
        width: 28px;
        height: 28px;
        background: white;
        border-radius: 50%;
        top: 4px;
        left: ${props => props.$yearly ? '38px' : '4px'};
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    &:hover {
        transform: scale(1.05);
    }
`;

const SaveBadge = styled.span`
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    animation: ${pulse} 2s ease-in-out infinite;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
`;

const TrustBadges = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 3rem;
    animation: ${fadeInUp} 1s ease-out 0.6s backwards;
    z-index: 2;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        gap: 1rem;
    }
`;

const TrustBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.3s ease;

    svg {
        color: #3b82f6;
    }

    &:hover {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
        color: #f8fafc;
        transform: translateY(-2px);
    }
`;

// ─── NEW CODE START — Performance Trust Strip (above pricing cards) ───
const PerformanceStrip = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    flex-wrap: wrap;
    margin: 0 auto 2.5rem;
    padding: 1rem 1.5rem;
    max-width: 980px;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(16, 185, 129, 0.10) 0%, transparent 55%),
        radial-gradient(120% 120% at 100% 100%, rgba(0, 173, 237, 0.10) 0%, transparent 55%),
        rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(16, 185, 129, 0.30);
    border-radius: 14px;
    box-shadow: 0 0 30px rgba(16, 185, 129, 0.10);
    animation: ${fadeInUp} 0.9s ease-out 0.4s backwards;
    position: relative;
    z-index: 2;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        border-top-left-radius: 14px;
        border-top-right-radius: 14px;
        background: linear-gradient(90deg, #10b981, #00adef, #f97316);
    }

    @media (max-width: 768px) {
        gap: 0.75rem;
        padding: 0.85rem 1rem;
    }
`;

const PerformancePill = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.55rem 1rem;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(16, 185, 129, 0.35);
    color: #f8fafc;
    font-size: 0.88rem;
    font-weight: 800;
    letter-spacing: 0.01em;

    .num {
        color: #10b981;
        font-size: 1rem;
        font-weight: 900;
    }
    .label {
        color: #94a3b8;
        font-weight: 600;
    }

    svg { color: #10b981; flex: 0 0 auto; }
`;
// ─── NEW CODE END ───

const PricingGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 1.25rem;
    max-width: 1600px;
    width: 100%;
    z-index: 2;
    padding: 0 1rem;
    perspective: 1000px;
    align-items: stretch;

    @media (max-width: 1500px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        max-width: 1100px;
    }

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
        max-width: 400px;
    }
`;

// ─── NEW CODE START — Premium pulse for visual hierarchy ───
const premiumPulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 rgba(249, 115, 22, 0.0), 0 0 0 rgba(249, 115, 22, 0.0); }
    50%      { box-shadow: 0 0 36px rgba(249, 115, 22, 0.35), 0 0 80px rgba(249, 115, 22, 0.18); }
`;
// ─── NEW CODE END ───

const CardWrapper = styled.div`
    position: relative;
    animation: ${fadeInUp} 0.8s ease-out ${props => props.$delay}s backwards;
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
    height: 100%;
    /* ─── NEW CODE START — slightly larger premium scale + ambient glow ─── */
    ${p => p.$premium && css`
        transform: scale(1.05);
        z-index: 2;
        border-radius: 22px;
        animation: ${fadeInUp} 0.8s ease-out ${p.$delay}s backwards,
                   ${premiumPulse} 3.6s ease-in-out infinite;
    `}
    /* ─── NEW CODE END ─── */

    &:hover {
        transform: translateY(-10px) ${p => p.$premium ? 'scale(1.07)' : ''};
    }
`;

const AnimatedBorder = styled.div`
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 22px;
    background: ${props => props.$gradient};
    z-index: -1;
    opacity: 0;
    transition: opacity 0.4s ease;

    ${CardWrapper}:hover & {
        opacity: 1;
    }

    &::before {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        right: 2px;
        bottom: 2px;
        background: #0f172a;
        border-radius: 20px;
    }
`;

const Card = styled.div`
    background: linear-gradient(
        135deg, 
        rgba(15, 23, 42, 0.95) 0%, 
        rgba(30, 41, 59, 0.9) 50%,
        rgba(15, 23, 42, 0.95) 100%
    );
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 1.75rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.4s ease;

    ${props => props.$featured && css`
        border: 2px solid transparent;
        background: linear-gradient(
            135deg, 
            rgba(15, 23, 42, 0.98) 0%, 
            rgba(30, 41, 59, 0.95) 50%,
            rgba(15, 23, 42, 0.98) 100%
        );
        
        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 20px;
            padding: 2px;
            background: ${props.$borderGradient};
            -webkit-mask: 
                linear-gradient(#fff 0 0) content-box, 
                linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }
    `}

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(255, 255, 255, 0.02) 50%,
            transparent 100%
        );
        pointer-events: none;
    }
`;

const CardGlow = styled.div`
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
        circle at center,
        ${props => props.$color}15 0%,
        transparent 50%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;

    ${CardWrapper}:hover & {
        opacity: 1;
    }
`;

const CardShimmer = styled.div`
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.03),
        transparent
    );
    transition: left 0.6s ease;

    ${CardWrapper}:hover & {
        left: 150%;
    }
`;

const PlanHeader = styled.div`
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
`;

const PlanTag = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.75rem;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.75rem;
    animation: ${megaGlow} 3s ease-in-out infinite;
    
    ${props => props.$type === 'free' && css`
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5);
    `}
    
    ${props => props.$type === 'popular' && css`
        background: linear-gradient(135deg, #f97316, #ea580c);
        box-shadow: 0 4px 20px rgba(249, 115, 22, 0.5);
    `}
    
    ${props => props.$type === 'value' && css`
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.5);
    `}
`;

const IconWrapper = styled.div`
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    background: ${props => props.$gradient};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    animation: ${float} 4s ease-in-out infinite;
    animation-delay: ${props => props.$delay || 0}s;
    box-shadow: 0 10px 40px ${props => props.$shadow};

    &::before {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        background: ${props => props.$gradient};
        z-index: -1;
        opacity: 0.3;
        filter: blur(10px);
    }

    &::after {
        content: '';
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        border: 1px dashed ${props => props.$borderColor || 'rgba(255,255,255,0.2)'};
        animation: ${rotate} 30s linear infinite;
    }
`;

const PlanName = styled.h2`
    font-size: 1.5rem;
    font-weight: 800;
    margin-bottom: 0.3rem;
    background: ${props => props.$gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const PlanDescription = styled.p`
    font-size: 0.85rem;
    color: #94a3b8;
    font-weight: 500;
`;

// ─── NEW CODE START — Premium tagline ("Real trades. Real results.") ───
const PlanTagline = styled.p`
    margin: 0.35rem 0 0 0;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #f97316;
    text-transform: uppercase;
`;

// Subtle urgency line that sits directly under the Premium CTAs.
// Intentionally not a countdown or aggressive — soft, warm, scarcity-flavored.
const UrgencyLine = styled.p`
    margin: 0.75rem 0 0 0;
    text-align: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: #fbbf24;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;

    svg {
        width: 12px;
        height: 12px;
        flex: 0 0 auto;
    }
`;
// ─── NEW CODE END ───

const PriceContainer = styled.div`
    margin: 1rem 0;
    position: relative;
    z-index: 1;
`;

const OriginalPrice = styled.div`
    font-size: 1.2rem;
    color: #64748b;
    text-decoration: line-through;
    margin-bottom: 0.3rem;
    opacity: ${props => props.$show ? 1 : 0};
    height: ${props => props.$show ? 'auto' : '0'};
    transition: all 0.3s ease;
`;

const Price = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.3rem;
`;

const Currency = styled.span`
    font-size: 1.5rem;
    font-weight: 600;
    color: #94a3b8;
`;

const Amount = styled.span`
    font-size: 3rem;
    font-weight: 900;
    background: ${props => props.$gradient || 'linear-gradient(135deg, #f8fafc, #cbd5e1)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    animation: ${countUp} 0.5s ease-out;
`;

const Period = styled.span`
    font-size: 1rem;
    color: #64748b;
`;

const FeatureSection = styled.div`
    flex: 1;
    text-align: left;
    margin: 1rem 0;
    position: relative;
    z-index: 1;
    overflow-y: auto;
    max-height: 320px;
    
    &::-webkit-scrollbar {
        width: 4px;
    }
    
    &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
    }
`;

const FeatureCategory = styled.div`
    margin-bottom: 0.75rem;
`;

const CategoryLabel = styled.div`
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${props => props.$color || '#64748b'};
    margin-bottom: 0.4rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, ${props => props.$color || '#64748b'}40, transparent);
    }
`;

const FeatureList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const FeatureItem = styled.li`
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #cbd5e1;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
    padding: 0.2rem 0;

    &:hover {
        color: #f8fafc;
        transform: translateX(3px);
    }

    svg {
        flex-shrink: 0;
        margin-top: 2px;
    }
`;

const CheckIcon = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${props => props.$gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
        width: 9px;
        height: 9px;
        color: white;
    }
`;

const HighlightFeature = styled(FeatureItem)`
    background: ${props => props.$bg || 'rgba(59, 130, 246, 0.1)'};
    border: 1px solid ${props => props.$border || 'rgba(59, 130, 246, 0.2)'};
    border-radius: 6px;
    padding: 0.4rem 0.5rem;
    margin-bottom: 0.5rem;

    &:hover {
        background: ${props => props.$bgHover || 'rgba(59, 130, 246, 0.15)'};
    }
`;

const CTAButton = styled.button`
    width: 100%;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: auto;
    background: ${props => props.$gradient};
    color: white;
    box-shadow: 0 8px 30px ${props => props.$shadow};

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
        );
        transition: left 0.5s ease;
    }

    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px ${props => props.$shadowHover};

        &::before {
            left: 100%;
        }

        svg {
            transform: translateX(5px);
        }
    }

    &:active:not(:disabled) {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    svg {
        transition: transform 0.3s ease;
    }
`;

const RippleEffect = styled.span`
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    animation: ${ripple} 0.6s linear;
    pointer-events: none;
`;

const ComparisonBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: ${props => props.$bg || 'rgba(16, 185, 129, 0.1)'};
    border: 1px solid ${props => props.$border || 'rgba(16, 185, 129, 0.3)'};
    border-radius: 6px;
    padding: 0.4rem 0.75rem;
    margin-top: 0.75rem;
    font-size: 0.75rem;
    color: ${props => props.$color || '#10b981'};
    font-weight: 600;

    svg {
        width: 14px;
        height: 14px;
    }
`;

const CurrentPlanBadge = styled.div`
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 0.5rem 1.25rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 10;
    animation: ${pulse} 2s ease-in-out infinite;

    svg {
        width: 16px;
        height: 16px;
    }
`;

const ActivePlanButton = styled.button`
    width: 100%;
    padding: 0.85rem 1.5rem;
    border: 2px solid #10b981;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 700;
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    cursor: default;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: auto;

    svg {
        width: 18px;
        height: 18px;
    }
`;

const TrialButton = styled.button`
    width: 100%;
    padding: 0.7rem 1.5rem;
    border: 2px dashed #f97316;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 700;
    background: rgba(249, 115, 22, 0.08);
    color: #f97316;
    cursor: pointer;
    margin-top: 0.75rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: rgba(249, 115, 22, 0.18);
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const TrialActiveBadge = styled.div`
    width: 100%;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    text-align: center;
    margin-top: 0.75rem;
`;

const StatsSection = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    max-width: 1200px;
    width: 100%;
    margin: 5rem 0;
    z-index: 2;
    animation: ${fadeInUp} 1s ease-out 1s backwards;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }
`;

const StatCard = styled.div`
    text-align: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(59, 130, 246, 0.05);
        border-color: rgba(59, 130, 246, 0.2);
        transform: translateY(-5px);
    }
`;

const StatNumber = styled.div`
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
    font-size: 1rem;
    color: #94a3b8;
`;

const FooterSection = styled.div`
    text-align: center;
    z-index: 2;
    margin-top: 4rem;
    animation: ${fadeInUp} 1s ease-out 1.2s backwards;
`;

const Hashtags = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
`;

const Hashtag = styled.span`
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 20px;
    font-size: 0.9rem;
    color: #94a3b8;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
        border-color: rgba(59, 130, 246, 0.4);
        color: #f8fafc;
        transform: translateY(-3px);
        box-shadow: 0 5px 20px rgba(59, 130, 246, 0.2);
    }
`;

const FooterText = styled.p`
    font-size: 1rem;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;

    span {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

const Guarantee = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1rem 2rem;
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 12px;
    color: #10b981;
    font-weight: 600;
    
    svg {
        width: 24px;
        height: 24px;
    }
`;

// ============ COMPONENT ============
const PricingPage = () => {
    const { api, user, refreshUser } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { currentPlan, trial, startTrial } = useSubscription();
    const [yearly, setYearly] = useState(false);
    const [loading, setLoading] = useState(null);
    const [ripples, setRipples] = useState({});

    // Handle canceled checkout redirect
    useEffect(() => {
        const canceled = searchParams.get('canceled');
        if (canceled === 'true') {
            setSearchParams({});
            toast.info('Checkout was canceled. Feel free to try again when you\'re ready!', 'Checkout Canceled');
        }
    }, [searchParams, setSearchParams, toast]);

    // Check if user has this plan
    const isCurrentPlan = (planId) => {
        return currentPlan === planId;
    };

    const PRICE_IDS = {
        starter: yearly ? 'price_1SfTvNCd6gxWUimR5g3pUz9g' : 'price_1SfTvNCd6gxWUimRapg2v7zC',
        pro: yearly ? 'price_1SfTxUCd6gxWUimRDKXxf5B9' : 'price_1SfTxUCd6gxWUimRfpe40Nr2',
        premium: yearly ? 'price_1SfU0WCd6gxWUimRj1tdL545' : 'price_1SfU0WCd6gxWUimRjjA8XnFr',
        elite: yearly ? 'price_1SfU1VCd6gxWUimR0tUeO70P' : 'price_1SfU1VCd6gxWUimReOuVaFb4'
    };

    const prices = {
        starter: { monthly: 15, yearly: 144 },
        pro: { monthly: 25, yearly: 240 },
        premium: { monthly: 50, yearly: 480 },
        elite: { monthly: 125, yearly: 1200 }
    };

    // Get the appropriate CTA button text based on user's current plan
    const getCtaText = (planId) => {
        if (currentPlan && currentPlan !== 'free' && currentPlan !== planId) {
            // User is upgrading/downgrading to a different paid plan
            const planNames = { starter: 'Starter', pro: 'Pro', premium: 'Premium', elite: 'Elite' };
            return `Upgrade to ${planNames[planId] || planId}`;
        }
        // Default CTA text
        const planCtas = {
            free: user ? 'Go to Dashboard' : 'Start Free',
            starter: 'Unlock Starter',
            pro: 'Unlock Pro',
            premium: 'Unlock Premium',
            elite: 'Go Elite'
        };
        return planCtas[planId] || 'Subscribe';
    };

    // Launch promo: 25% off for 30 days (expires May 1, 2026)
    const LAUNCH_PROMO_END = new Date('2026-05-01T00:00:00Z');
    const isLaunchPromo = new Date() < LAUNCH_PROMO_END;
    const DISCOUNT = 0.25;
    const daysLeft = isLaunchPromo ? Math.ceil((LAUNCH_PROMO_END - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    const createRipple = (e, planId) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        setRipples(prev => ({
            ...prev,
            [planId]: { x, y, size }
        }));

        setTimeout(() => {
            setRipples(prev => {
                const newRipples = { ...prev };
                delete newRipples[planId];
                return newRipples;
            });
        }, 600);
    };

    const handleFreeTier = () => {
        if (!user) {
            navigate('/register');
        } else {
            navigate('/dashboard');
        }
    };

    const handleStartTrial = async () => {
        if (!user) {
            toast.warning('Please log in to start your free trial', 'Login Required');
            navigate('/login');
            return;
        }
        setLoading('trial');
        const result = await startTrial();
        if (result.success) {
            toast.success('Premium trial activated! Enjoy 7 days of full access.', 'Trial Started');
        } else {
            toast.error(result.error || 'Failed to start trial', 'Error');
        }
        setLoading(null);
    };

    const handleSubscribe = async (plan, e) => {
        createRipple(e, plan);

        if (!user) {
            toast.warning('Please log in to subscribe', 'Login Required');
            navigate('/login');
            return;
        }

        setLoading(plan);

        try {
            const priceId = PRICE_IDS[plan];
            
            // Check if user has an active subscription (upgrade path)
            if (currentPlan && currentPlan !== 'free' && currentPlan !== plan) {
                // This is an upgrade/downgrade - use upgrade endpoint
                console.log(`[Pricing] Upgrading from ${currentPlan} to ${plan}`);
                const response = await api.post('/stripe/upgrade-subscription', { newPriceId: priceId });
                
                if (response.data.success) {
                    toast.success(
                        response.data.proration.message, 
                        'Plan Updated'
                    );
                    await refreshUser();
                    // Scroll to show the updated plan
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 500);
                } else {
                    toast.error(response.data.error || 'Failed to update plan', 'Error');
                }
            } else {
                // This is a new purchase - use checkout
                console.log(`[Pricing] Creating new subscription for ${plan}`);
                const response = await api.post('/stripe/create-checkout-session', { priceId });
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Subscription error:', error);
            
            // Check if error indicates no active subscription (should create new checkout)
            if (error.response?.data?.requiresNewCheckout) {
                try {
                    const priceId = PRICE_IDS[plan];
                    const response = await api.post('/stripe/create-checkout-session', { priceId });
                    window.location.href = response.data.url;
                } catch (checkoutError) {
                    console.error('Checkout error:', checkoutError);
                    toast.error('Failed to start checkout. Please try again.', 'Error');
                }
            } else {
                toast.error(error.response?.data?.error || 'Failed to update subscription. Please try again.', 'Error');
            }
        } finally {
            setLoading(null);
        }
    };

    // ============ PLAN CONFIGURATIONS — SIGNALS vs PREDICTIONS SPLIT ============
    const plans = [
        {
            id: 'free',
            name: 'Free',
            description: 'Explore the platform — see how it works',
            icon: Gift,
            tag: { text: 'Forever Free', type: 'free', icon: Sparkles },
            price: { monthly: 0, yearly: 0 },
            gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            shadow: 'rgba(99, 102, 241, 0.4)',
            borderGradient: 'linear-gradient(135deg, #6366f1, #4f46e5, #6366f1)',
            features: [
                { category: '📊 AI Predictions', color: '#6366f1', items: [
                    'View prediction outcomes (read-only)',
                    'No forecast generation',
                ]},
                { category: '⚡ Trade Signals', color: '#475569', items: [
                    'Delayed signal feed (no trade levels)',
                    'View signal results only',
                ]},
                { category: '🛠 Platform Tools', color: '#3b82f6', items: [
                    '$100K Paper Trading portfolio',
                    'Social feed & leaderboards',
                    '93 achievements & cosmetic vault',
                ]}
            ],
            cta: user ? 'Go to Dashboard' : 'Start Free',
            ctaAction: handleFreeTier,
            comparison: 'Preview the system — upgrade for full access'
        },
        {
            id: 'starter',
            name: 'Starter',
            description: 'Start trading with real predictions and signals',
            icon: Star,
            price: prices.starter,
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
            shadow: 'rgba(16, 185, 129, 0.4)',
            borderGradient: 'linear-gradient(135deg, #10b981, #059669, #10b981)',
            features: [
                { category: '📊 AI Predictions', color: '#10b981', items: [
                    { text: '3 AI price forecasts / day', highlight: true },
                    'Confidence scoring & direction',
                    'Prediction outcome tracking',
                ]},
                { category: '⚡ Trade Signals', color: '#10b981', items: [
                    { text: '5 real-time signals / day', highlight: true },
                    'Entry, stop loss & take profit levels',
                    'Basic signal analysis',
                ]},
                { category: '🛠 Platform Tools', color: '#3b82f6', items: [
                    '1 watchlist (10 stocks)',
                    'Stock screener & news feed',
                    'Trade journal & sentiment',
                ]}
            ],
            comparison: '5 signals/day + 3 forecasts/day',
            cta: 'Unlock Starter'
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'More forecasts + AI chat for active traders',
            icon: Rocket,
            price: prices.pro,
            gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            shadow: 'rgba(59, 130, 246, 0.4)',
            borderGradient: 'linear-gradient(135deg, #3b82f6, #2563eb, #3b82f6)',
            features: [
                { category: '📊 AI Predictions', color: '#3b82f6', items: [
                    { text: '10 AI price forecasts / day', highlight: true },
                    { text: 'AI Chat — ask about any asset', highlight: true },
                    'Full forecast analysis & reasoning',
                ]},
                { category: '⚡ Trade Signals', color: '#3b82f6', items: [
                    { text: '15 real-time signals / day', highlight: true },
                    'Full signal breakdown & conviction',
                    'Swing trading tools',
                ]},
                { category: '🛠 Platform Tools', color: '#10b981', items: [
                    '3 watchlists (30 stocks each)',
                    'Market heatmap & technical indicators',
                    'Real-time price alerts',
                    'Stock comparison tools',
                ]}
            ],
            comparison: '15 signals/day + 10 forecasts/day + AI chat',
            cta: 'Upgrade to Pro'
        },
        {
            id: 'premium',
            // ─── NEW CODE START — Premium copy + outcome-first features ───
            name: 'Premium',
            description: 'Unlock All AI Trade Setups',
            tagline: 'Real trades. Real results. Fully tracked.',
            // ─── NEW CODE END ───
            icon: TrendingUp,
            tag: { text: 'Most Popular', type: 'popular', icon: Zap },
            featured: true,
            price: prices.premium,
            gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
            shadow: 'rgba(249, 115, 22, 0.4)',
            borderGradient: 'linear-gradient(135deg, #f97316, #ea580c, #f97316)',
            features: [
                // ─── NEW CODE START — Outcome-focused feature category leads ───
                { category: '🎯 What You Actually Get', color: '#f97316', items: [
                    { text: '300+ tracked trades — every one public', highlight: true, special: true },
                    { text: 'Live trade alerts the moment a setup forms', highlight: true },
                    { text: 'Full entry, take-profit, and stop-loss breakdown', highlight: true },
                    { text: 'Full performance tracking — wins AND losses', highlight: true },
                ]},
                // ─── NEW CODE END ───
                { category: '📊 Unlimited AI Predictions', color: '#f97316', items: [
                    { text: 'Unlimited AI price forecasts', highlight: true },
                    { text: 'Prediction accuracy analytics', highlight: true },
                    { text: 'GPT-4 Turbo AI chat assistant', highlight: true },
                    'Prediction history & tracking',
                ]},
                { category: '⚡ Unlimited Trade Signals', color: '#f97316', items: [
                    { text: 'Unlimited real-time trade signals', highlight: true },
                    { text: 'Pattern scanner & recognition', highlight: true },
                    'Live signal tracking & outcomes',
                    'Discovery page + sector analysis',
                ]},
                { category: '🐋 Whale Intelligence', color: '#f59e0b', items: [
                    { text: 'Whale alerts — large trades first', highlight: true, special: true },
                    'Dark pool + institutional flow',
                    'Congressional trade alerts',
                    'Portfolio tracking & optimization',
                    'Unlimited watchlists',
                ]}
            ],
            comparison: 'Unlimited predictions + signals + whale intel',
            // ─── NEW CODE START — CTA flipped from "Go Premium" to trial ───
            cta: 'Start Free Trial'
            // ─── NEW CODE END ───
        },
        {
            id: 'elite',
            name: 'Elite',
            description: 'Maximum tools for professional traders',
            icon: Crown,
            tag: { text: 'Power User', type: 'value', icon: Award },
            featured: true,
            price: prices.elite,
            gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            shadow: 'rgba(139, 92, 246, 0.4)',
            borderGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #8b5cf6)',
            features: [
                { category: '📊 Everything Unlimited +', color: '#8b5cf6', items: [
                    { text: 'Strategy backtesting engine (6 strategies)', highlight: true },
                    { text: 'Whale alert API + institutional flow', highlight: true },
                    { text: 'API key management', highlight: true },
                    'Advanced portfolio analytics',
                ]},
                { category: '⚡ Full Signal + Prediction Access', color: '#8b5cf6', items: [
                    'All Premium features included',
                    'Multi-account management',
                    'Priority feature requests',
                    'Early access to new features',
                ]}
            ],
            comparison: 'Backtesting + whale API + everything unlimited',
            cta: 'Go Elite'
        }
    ];

    return (
        <PricingContainer>
            <SEO
                title="Pricing — Start Free, Upgrade Anytime | Nexus Signal AI"
                description="Plans from free to elite. 7-day free trial on Premium. Every tier gets real AI trade signals with tracked results. Cancel anytime."
                keywords="Nexus Signal pricing, AI trading subscription, stock prediction plans, free trial, trading platform pricing"
            />
            {/* Cosmic Background */}
            <CosmicBackground>
                <StarField>
                    <StarLayer 
                        $stars="radial-gradient(1px 1px at 20px 30px, white, transparent), radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 50px 160px, white, transparent), radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.9), transparent), radial-gradient(1px 1px at 130px 80px, white, transparent), radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.7), transparent)"
                        $size={200}
                        $duration={100}
                        $opacity={0.5}
                    />
                    <StarLayer 
                        $stars="radial-gradient(1.5px 1.5px at 100px 50px, white, transparent), radial-gradient(1.5px 1.5px at 200px 150px, rgba(255,255,255,0.9), transparent), radial-gradient(1.5px 1.5px at 300px 250px, white, transparent), radial-gradient(1.5px 1.5px at 400px 100px, rgba(255,255,255,0.8), transparent)"
                        $size={400}
                        $duration={150}
                        $opacity={0.4}
                    />
                </StarField>
                <AuroraEffect />
                <GridOverlay />
                
                {/* Floating Orbs */}
                <FloatingOrb $size={300} $color="#3b82f6" $blur={80} $duration={25} $delay={0} $top={10} $left={10} />
                <FloatingOrb $size={250} $color="#8b5cf6" $blur={60} $duration={30} $delay={5} $top={60} $left={80} />
                <FloatingOrb $size={200} $color="#f97316" $blur={70} $duration={20} $delay={10} $top={80} $left={20} />
                
                {/* Shooting Stars */}
                <ShootingStar $duration={3} $delay={0} $top={10} $left={20} />
                <ShootingStar $duration={4} $delay={2} $top={30} $left={60} />
                <ShootingStar $duration={3.5} $delay={5} $top={50} $left={10} />
                <ShootingStar $duration={4.5} $delay={8} $top={15} $left={80} />
            </CosmicBackground>

            {/* Header */}
            <HeaderSection>
                <LogoContainer onClick={() => navigate('/')}>
                    <LogoRing />
                    <HeaderLogo src={nexusSignalLogo} alt="Nexus Signal AI" />
                </LogoContainer>
                
                <Title>
                    Stop guessing. Start trading with <GradientText>verified data.</GradientText>
                </Title>

                <Subtitle>
                    Every signal and prediction is tracked publicly — so you know exactly what works.
                    Upgrade for real-time trade signals, unlimited AI forecasts, and full analytics.
                </Subtitle>
            </HeaderSection>

            {/* Billing Toggle */}
            <BillingToggleContainer>
                <BillingLabel $active={!yearly}>Monthly</BillingLabel>
                <ToggleSwitch $yearly={yearly} onClick={() => setYearly(!yearly)} />
                <BillingLabel $active={yearly}>Yearly</BillingLabel>
                {yearly && <SaveBadge>Save 20%</SaveBadge>}
            </BillingToggleContainer>

            {/* Trust Badges - UPDATED */}
            <TrustBadges>
                <TrustBadge>
                    <Shield size={18} />
                    Secure Payments via Stripe
                </TrustBadge>
                <TrustBadge>
                    <CheckCircle size={18} />
                    Every Trade Tracked Publicly
                </TrustBadge>
                <TrustBadge>
                    <Lock size={18} />
                    Cancel Anytime
                </TrustBadge>
            </TrustBadges>

            {/* ─── NEW CODE START — Performance Trust Strip ─── */}
            <PerformanceStrip>
                <PerformancePill>
                    <TrendingUp size={14} />
                    <span className="num">300+</span>
                    <span className="label">Trades Tracked</span>
                </PerformancePill>
                <PerformancePill>
                    <Award size={14} />
                    <span className="num">~60%</span>
                    <span className="label">Win Rate</span>
                </PerformancePill>
                <PerformancePill>
                    <CheckCircle size={14} />
                    <span className="label">No Cherry-Picking — Every Trade Public</span>
                </PerformancePill>
            </PerformanceStrip>
            {/* ─── NEW CODE END ─── */}

            {/* Pricing Cards */}
            <PricingGrid>
                {plans.map((plan, index) => (
                    <CardWrapper key={plan.id} $delay={index * 0.1} $premium={plan.id === 'premium'}>
                        <AnimatedBorder $gradient={plan.borderGradient} />
                        <Card $featured={plan.featured || isCurrentPlan(plan.id)} $borderGradient={isCurrentPlan(plan.id) ? 'linear-gradient(135deg, #10b981, #059669, #10b981)' : plan.borderGradient}>
                            {isCurrentPlan(plan.id) && (
                                <CurrentPlanBadge>
                                    <CheckCircle size={16} />
                                    Your Current Plan
                                </CurrentPlanBadge>
                            )}
                            <CardGlow $color={isCurrentPlan(plan.id) ? '#10b981' : (plan.gradient.match(/#[a-fA-F0-9]{6}/)?.[0] || '#3b82f6')} />
                            <CardShimmer />

                            <PlanHeader>
                                {plan.tag && (
                                    <PlanTag $type={plan.tag.type}>
                                        <plan.tag.icon size={14} />
                                        {plan.tag.text}
                                    </PlanTag>
                                )}
                                
                                <IconWrapper 
                                    $gradient={plan.gradient} 
                                    $shadow={plan.shadow}
                                    $delay={index * 0.2}
                                    $borderColor={plan.gradient.match(/#[a-fA-F0-9]{6}/)?.[0]}
                                >
                                    <plan.icon size={28} color="white" />
                                </IconWrapper>
                                
                                <PlanName $gradient={plan.gradient}>{plan.name}</PlanName>
                                <PlanDescription>{plan.description}</PlanDescription>
                                {/* NEW: optional tagline (Premium uses it) */}
                                {plan.tagline && <PlanTagline>{plan.tagline}</PlanTagline>}
                            </PlanHeader>

                            <PriceContainer>
                                {isLaunchPromo && plan.price.monthly > 0 && (
                                    <div style={{background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',padding:'3px 10px',borderRadius:'6px',fontSize:'.7rem',fontWeight:700,letterSpacing:'.03em',marginBottom:'.4rem',display:'inline-block'}}>
                                        LAUNCH SALE — 25% OFF ({daysLeft}d left)
                                    </div>
                                )}
                                <OriginalPrice $show={(yearly || isLaunchPromo) && plan.price.monthly > 0}>
                                    {isLaunchPromo
                                        ? `$${yearly ? Math.round(plan.price.yearly / 12) : plan.price.monthly}/mo`
                                        : `$${plan.price.monthly * 12}/year`
                                    }
                                </OriginalPrice>
                                <Price>
                                    <Currency>$</Currency>
                                    <Amount $gradient={plan.gradient}>
                                        {(() => {
                                            const base = yearly ? Math.round(plan.price.yearly / 12) : plan.price.monthly;
                                            return isLaunchPromo && plan.price.monthly > 0
                                                ? Math.round(base * (1 - DISCOUNT))
                                                : base;
                                        })()}
                                    </Amount>
                                    <Period>/mo</Period>
                                </Price>
                                {yearly && plan.price.monthly > 0 && (
                                    <Period style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                        {isLaunchPromo
                                            ? `Billed $${Math.round(plan.price.yearly * (1 - DISCOUNT))}/year`
                                            : `Billed $${plan.price.yearly}/year`
                                        }
                                    </Period>
                                )}
                            </PriceContainer>

                            <FeatureSection>
                                {plan.features.map((category, catIndex) => (
                                    <FeatureCategory key={catIndex}>
                                        <CategoryLabel $color={category.color}>
                                            {category.category}
                                        </CategoryLabel>
                                        <FeatureList>
                                            {category.items.map((item, itemIndex) => {
                                                const isObject = typeof item === 'object';
                                                const text = isObject ? item.text : item;
                                                const highlight = isObject && item.highlight;
                                                const special = isObject && item.special;

                                                if (highlight) {
                                                    return (
                                                        <HighlightFeature 
                                                            key={itemIndex}
                                                            $bg={special ? 'rgba(249, 115, 22, 0.1)' : `${category.color}15`}
                                                            $border={special ? 'rgba(249, 115, 22, 0.3)' : `${category.color}30`}
                                                            $bgHover={special ? 'rgba(249, 115, 22, 0.2)' : `${category.color}25`}
                                                        >
                                                            <CheckIcon $gradient={special ? 'linear-gradient(135deg, #f97316, #ea580c)' : plan.gradient}>
                                                                <Check />
                                                            </CheckIcon>
                                                            <span style={{ fontWeight: 600 }}>{text}</span>
                                                        </HighlightFeature>
                                                    );
                                                }

                                                return (
                                                    <FeatureItem key={itemIndex}>
                                                        <CheckIcon $gradient={plan.gradient}>
                                                            <Check />
                                                        </CheckIcon>
                                                        {text}
                                                    </FeatureItem>
                                                );
                                            })}
                                        </FeatureList>
                                    </FeatureCategory>
                                ))}
                            </FeatureSection>

                            {plan.comparison && (
                                <ComparisonBadge
                                    $bg={`${plan.gradient.match(/#[a-fA-F0-9]{6}/)?.[0]}15`}
                                    $border={`${plan.gradient.match(/#[a-fA-F0-9]{6}/)?.[0]}40`}
                                    $color={plan.gradient.match(/#[a-fA-F0-9]{6}/)?.[0]}
                                >
                                    <Infinity size={14} />
                                    {plan.comparison}
                                </ComparisonBadge>
                            )}

                            {isCurrentPlan(plan.id) ? (
                                <ActivePlanButton>
                                    <CheckCircle size={18} />
                                    Active Plan
                                </ActivePlanButton>
                            ) : (
                                <CTAButton
                                    $gradient={plan.gradient}
                                    $shadow={plan.shadow}
                                    $shadowHover={plan.shadow.replace('0.4', '0.6')}
                                    onClick={(e) => plan.ctaAction ? plan.ctaAction() : handleSubscribe(plan.id, e)}
                                    disabled={loading !== null}
                                >
                                    {ripples[plan.id] && (
                                        <RippleEffect
                                            style={{
                                                left: ripples[plan.id].x,
                                                top: ripples[plan.id].y,
                                                width: ripples[plan.id].size,
                                                height: ripples[plan.id].size
                                            }}
                                        />
                                    )}
                                    {loading === plan.id ? 'Processing...' : getCtaText(plan.id)}
                                    <ArrowRight size={16} />
                                </CTAButton>
                            )}

                            {/* Free Trial button for Premium plan */}
                            {plan.id === 'premium' && !isCurrentPlan('premium') && !trial?.used && !trial?.active && (
                                <TrialButton onClick={handleStartTrial} disabled={loading !== null}>
                                    {loading === 'trial' ? 'Activating...' : '🎉 Start 7-Day Free Trial'}
                                </TrialButton>
                            )}
                            {plan.id === 'premium' && trial?.active && (
                                <TrialActiveBadge>
                                    ✅ Trial Active — Expires {new Date(trial.endsAt).toLocaleDateString()}
                                </TrialActiveBadge>
                            )}

                            {/* ─── NEW CODE START — Subtle urgency line under Premium ─── */}
                            {plan.id === 'premium' && (
                                <UrgencyLine>
                                    <Sparkles />
                                    Early users locked in at this price
                                </UrgencyLine>
                            )}
                            {/* ─── NEW CODE END ─── */}
                        </Card>
                    </CardWrapper>
                ))}
            </PricingGrid>

            {/* Stats Section */}
            <StatsSection>
                <StatCard>
                    <StatNumber>Tracked</StatNumber>
                    <StatLabel>Every prediction verified</StatLabel>
                </StatCard>
                <StatCard>
                    <StatNumber>Transparent</StatNumber>
                    <StatLabel>Wins & losses shown publicly</StatLabel>
                </StatCard>
                <StatCard>
                    <StatNumber>$100K</StatNumber>
                    <StatLabel>Paper trading on every plan</StatLabel>
                </StatCard>
                <StatCard>
                    <StatNumber>24/7</StatNumber>
                    <StatLabel>Stocks + Crypto coverage</StatLabel>
                </StatCard>
            </StatsSection>

            <FooterSection>
                <Guarantee>
                    <Shield />
                    Cancel Anytime · No Credit Card for Trial · Secure Payments via Stripe · 7-Day Free Trial on Premium
                </Guarantee>
            </FooterSection>
        </PricingContainer>
    );
};

export default PricingPage;