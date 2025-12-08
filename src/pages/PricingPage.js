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
    overflow: hidden;
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

const CardWrapper = styled.div`
    position: relative;
    animation: ${fadeInUp} 0.8s ease-out ${props => props.$delay}s backwards;
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
    height: 100%;

    &:hover {
        transform: translateY(-10px);
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
    padding: 0.85rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
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
    const { currentPlan } = useSubscription();
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
        starter: yearly ? 'price_starter_yearly' : 'price_1SV9d8CtdTItnGjydNZsbXl3',
        pro: yearly ? 'price_pro_yearly' : 'price_1SV9dTCtdTItnGjycfSxQtAg',
        premium: yearly ? 'price_premium_yearly' : 'price_1SV9doCtdTItnGjyYb8yG97j',
        elite: yearly ? 'price_elite_yearly' : 'price_1SV9eACtdTItnGjyzSNaNYhP'
    };

    const prices = {
        starter: { monthly: 15, yearly: 144 },
        pro: { monthly: 25, yearly: 240 },
        premium: { monthly: 50, yearly: 480 },
        elite: { monthly: 125, yearly: 1200 }
    };

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
            const response = await api.post('/stripe/create-checkout-session', { priceId });
            window.location.href = response.data.url;
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to start checkout. Please try again.', 'Error');
            setLoading(null);
        }
    };

    // ============ UPDATED PLAN CONFIGURATIONS ============
    const plans = [
        {
            id: 'free',
            name: 'Free',
            description: 'Start Your Journey',
            icon: Gift,
            tag: { text: 'Forever Free', type: 'free', icon: Sparkles },
            price: { monthly: 0, yearly: 0 },
            gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            shadow: 'rgba(99, 102, 241, 0.4)',
            borderGradient: 'linear-gradient(135deg, #6366f1, #4f46e5, #6366f1)',
            features: [
                { category: '🎮 Gamification', color: '#6366f1', items: [
                    'Achievement System (93 achievements)',
                    'Level Progression (1-100)',
                    'XP & Nexus Coins',
                    'Daily Login Rewards',
                    'Leaderboards',
                ]},
                { category: '📈 Paper Trading', color: '#3b82f6', items: [
                    '$100,000 Virtual Cash',
                    'Real Market Simulation',
                    'Trade History & Analytics',
                    'Portfolio Tracking',
                ]},
                { category: '👥 Social', color: '#10b981', items: [
                    'Social Feed Access',
                    'Post & Comment',
                    'Follow Traders',
                ]}
            ],
            cta: user ? 'Go to Dashboard' : 'Get Started Free',
            ctaAction: handleFreeTier
        },
        {
            id: 'starter',
            name: 'Starter',
            description: 'Enhanced Analytics',
            icon: Star,
            price: prices.starter,
            gradient: 'linear-gradient(135deg, #10b981, #059669)',
            shadow: 'rgba(16, 185, 129, 0.4)',
            borderGradient: 'linear-gradient(135deg, #10b981, #059669, #10b981)',
            features: [
                { category: 'Everything in Free +', color: '#10b981', items: [
                    { text: '5 AI Predictions/day', highlight: true },
                    'Watchlist (10 stocks)',
                    'Stock Screener Access',
                    'Market News Feed',
                    'Sentiment Analysis',
                    'Trade Journal',
                    'Email Support',
                ]}
            ],
            comparison: 'Start Trading Smart',
            cta: 'Get Started'
        },
        {
            id: 'pro',
            name: 'Pro',
            description: 'Accelerate Success',
            icon: Rocket,
            price: prices.pro,
            gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            shadow: 'rgba(59, 130, 246, 0.4)',
            borderGradient: 'linear-gradient(135deg, #3b82f6, #2563eb, #3b82f6)',
            features: [
                { category: 'Everything in Starter +', color: '#3b82f6', items: [
                    { text: '15 AI Predictions/day', highlight: true },
                    'Watchlist (30 stocks)',
                    { text: 'AI Chat Assistant', highlight: true },
                    'Advanced Market Heatmap',
                    'Technical Indicators',
                    'Real-Time Price Alerts',
                    'Advanced Stock Comparisons',
                    'Advanced Analysis Tools',
                    'Priority Email Support',
                ]}
            ],
            comparison: '3x More AI Power',
            cta: 'Upgrade to Pro'
        },
        {
            id: 'premium',
            name: 'Premium',
            description: 'Master The Markets',
            icon: TrendingUp,
            tag: { text: 'Most Popular', type: 'popular', icon: Zap },
            featured: true,
            price: prices.premium,
            gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
            shadow: 'rgba(249, 115, 22, 0.4)',
            borderGradient: 'linear-gradient(135deg, #f97316, #ea580c, #f97316)',
            features: [
                { category: 'Everything in Pro +', color: '#f97316', items: [
                    { text: 'Unlimited AI Predictions', highlight: true },
                    { text: 'Unlimited Watchlist Stocks', highlight: true },
                    'Advanced AI Chat (GPT-4 Turbo)',
                    'Prediction History & Analytics',
                    'Portfolio Optimization Tools',
                    'Custom Alerts & Notifications',
                    'In-Depth Sector Analysis',
                ]},
                { category: '🐋 Exclusive Features', color: '#f59e0b', items: [
                    { text: 'Whale Alerts (Large Volume Trades)', highlight: true, special: true },
                    'Dark Pool Flow Tracking',
                    'Institutional Activity Monitor',
                    'Discovery Page Access',
                    '24/7 Priority Support',
                ]}
            ],
            comparison: 'Unlimited Everything',
            cta: 'Go Premium'
        },
        {
            id: 'elite',
            name: 'Elite',
            description: 'Ultimate Market Edge',
            icon: Crown,
            tag: { text: 'Best Value', type: 'value', icon: Award },
            featured: true,
            price: prices.elite,
            gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            shadow: 'rgba(139, 92, 246, 0.4)',
            borderGradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed, #8b5cf6)',
            features: [
                { category: 'All Premium Features +', color: '#8b5cf6', items: [
                    { text: 'Ultra-Low Latency Data', highlight: true },
                    { text: 'Full API Access', highlight: true },
                    'Unlimited AI Research Reports',
                    'Custom Research & Insights',
                    'Advanced Backtesting Tools',
                    'Institutional-Grade Analytics',
                    'Multi-Account Management',
                    'White-Label Options',
                ]},
                { category: '👑 VIP Perks', color: '#a78bfa', items: [
                    { text: '🐋 Whale Alert Webhooks & API', highlight: true, special: true },
                    { text: '1-on-1 Trading Mentorship', highlight: true },
                    'Dedicated Account Manager',
                    'VIP Discord Community',
                    'Early Access to New Features',
                    'Custom Feature Requests',
                ]}
            ],
            comparison: 'Institutional Power',
            cta: 'Go Elite'
        }
    ];

    return (
        <PricingContainer>
            <SEO
                title="Pricing Plans | Nexus Signal AI"
                description="Choose the perfect plan for your trading needs. From free starter to elite professional plans. Get AI-powered stock predictions, unlimited watchlists, and advanced analytics."
                keywords="Nexus Signal pricing, AI trading subscription, stock prediction plans, trading platform pricing, investment tools cost"
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
                    Unlock Your <GradientText>Trading Edge</GradientText>
                </Title>
                
                <Subtitle>
                    AI-powered trading platform with gamification, social features, and institutional-grade analytics. 
                    Start free, scale when ready.
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
                    256-bit Encryption
                </TrustBadge>
                <TrustBadge>
                    <Lock size={18} />
                    SOC 2 Compliant
                </TrustBadge>
                <TrustBadge>
                    <Award size={18} />
                    #1 AI Trading Platform
                </TrustBadge>
            </TrustBadges>

            {/* Pricing Cards */}
            <PricingGrid>
                {plans.map((plan, index) => (
                    <CardWrapper key={plan.id} $delay={index * 0.1}>
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
                            </PlanHeader>

                            <PriceContainer>
                                <OriginalPrice $show={yearly && plan.price.monthly > 0}>
                                    ${plan.price.monthly * 12}/year
                                </OriginalPrice>
                                <Price>
                                    <Currency>$</Currency>
                                    <Amount $gradient={plan.gradient}>
                                        {yearly ? Math.round(plan.price.yearly / 12) : plan.price.monthly}
                                    </Amount>
                                    <Period>/mo</Period>
                                </Price>
                                {yearly && plan.price.monthly > 0 && (
                                    <Period style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                                        Billed ${plan.price.yearly}/year
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
                                    {loading === plan.id ? 'Processing...' : plan.cta}
                                    <ArrowRight size={16} />
                                </CTAButton>
                            )}
                        </Card>
                    </CardWrapper>
                ))}
            </PricingGrid>

            {/* Stats Section */}
            <StatsSection>
                <StatCard>
                    <StatNumber>$2.5B+</StatNumber>
                    <StatLabel>Volume Tracked</StatLabel>
                </StatCard>
                <StatCard>
                    <StatNumber>24/7</StatNumber>
                    <StatLabel>Market Coverage</StatLabel>
                </StatCard>
                <StatCard>
                    <StatNumber>150+</StatNumber>
                    <StatLabel>Data Sources</StatLabel>
                </StatCard>
                <StatCard>
                    <StatNumber>&lt;50ms</StatNumber>
                    <StatLabel>Data Latency</StatLabel>
                </StatCard>
            </StatsSection>

            {/* Footer - UPDATED */}
            <FooterSection>
                <Hashtags>
                    <Hashtag>#NexusSignalAI</Hashtag>
                    <Hashtag>#AITrading</Hashtag>
                    <Hashtag>#WhaleAlerts</Hashtag>
                    <Hashtag>#SmartMoney</Hashtag>
                    <Hashtag>#TradingCommunity</Hashtag>
                </Hashtags>

                {/* UPDATED - Free Trial instead of Money-Back Guarantee */}
                <Guarantee>
                    <Sparkles />
                    7-Day Free Trial on STARTER Plans • No Credit Card Required
                </Guarantee>

                <FooterText style={{ marginTop: '2rem' }}>
                    <span>📱 Mobile App Coming Summer 2026</span>
                    <span>•</span>
                    <span>🇺🇸 Made in USA</span>
                    <span>•</span>
                    <span>💯 Built by Real Traders</span>
                </FooterText>
            </FooterSection>
        </PricingContainer>
    );
};

export default PricingPage;