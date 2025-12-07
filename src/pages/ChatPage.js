// client/src/pages/ChatPage.js - THEMED VERSION

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import UpgradePrompt from '../components/UpgradePrompt';
import {
    Send, Brain, User, Sparkles, TrendingUp, AlertCircle,
    Zap, MessageSquare, Stars, Rocket, Flame, ChevronDown,
    Copy, ThumbsUp, ThumbsDown
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    position: relative;
    overflow: hidden;
    z-index: 1;
`;

const ParticleContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
`;

const Particle = styled.div`
    position: absolute;
    width: ${props => props.size}px;
    height: ${props => props.size}px;
    background: ${props => props.color};
    border-radius: 50%;
    left: ${props => props.left}%;
    opacity: 0.6;
    filter: blur(1px);
    
    ${props => css`
        animation: ${particles} ${props.duration}s linear infinite;
        animation-delay: ${props.delay}s;
    `}
`;

const Header = styled.div`
    padding: 2rem;
    text-align: center;
    background: transparent;
    border-bottom: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    position: relative;
    z-index: 1;
    animation: ${fadeIn} 0.6s ease-out;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    margin-bottom: 0.5rem;
    text-shadow: 0 0 20px ${props => props.theme?.brand?.primary || '#00adef'}60;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.05);
    }
`;

const TitleIcon = styled.div`
    animation: ${float} 3s ease-in-out infinite;
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
`;

const StatusBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, ${props => props.theme?.success || '#10b981'}33 0%, ${props => props.theme?.success || '#059669'}33 100%);
    border: 1px solid ${props => props.theme?.success || '#10b981'}66;
    border-radius: 20px;
    font-size: 0.9rem;
    color: ${props => props.theme?.success || '#10b981'};
    margin-top: 1rem;
    box-shadow: 0 0 20px ${props => props.theme?.success || '#10b981'}40;
`;

const ChatContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem;
    overflow: hidden;
    position: relative;
    z-index: 1;
`;

const MessagesArea = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 1rem;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme?.brand?.primary || '#00adef'}4D;
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}80;
    }
`;

const Message = styled.div`
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    
    ${props => props.$isUser ? css`
        flex-direction: row-reverse;
        animation: ${slideInRight} 0.5s ease-out;
    ` : css`
        animation: ${slideInLeft} 0.5s ease-out;
    `}
`;

const Avatar = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    transition: transform 0.3s ease;

    ${props => props.$isUser ? css`
        background: ${props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
        box-shadow: 0 4px 15px ${props.theme?.brand?.primary || '#00adef'}66;
    ` : css`
        background: linear-gradient(135deg, ${props.theme?.brand?.accent || '#8b5cf6'} 0%, ${props.theme?.brand?.accent || '#6366f1'}cc 100%);
        box-shadow: 0 4px 15px ${props.theme?.brand?.accent || '#8b5cf6'}66;
        animation: ${float} 3s ease-in-out infinite;
    `}

    &:hover {
        transform: scale(1.1) rotate(5deg);
    }

    &::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        background: ${props => props.theme?.success || '#10b981'};
        border: 2px solid #0a0e27;
        border-radius: 50%;
        bottom: 0;
        right: 0;
    }
`;

const MessageContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 70%;

    @media (max-width: 768px) {
        max-width: 85%;
    }
`;

const MessageBubble = styled.div`
    padding: 1rem 1.25rem;
    border-radius: 12px;
    line-height: 1.6;
    word-wrap: break-word;
    white-space: pre-wrap;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    ${props => props.$isUser ? css`
        background: ${props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
        color: white;
        border-bottom-right-radius: 4px;
        box-shadow: 0 4px 15px ${props.theme?.brand?.primary || '#00adef'}4D;
    ` : css`
        background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
        backdrop-filter: blur(10px);
        border: 1px solid ${props.theme?.brand?.primary || '#00adef'}33;
        color: ${props.theme?.text?.primary || '#e0e6ed'};
        border-bottom-left-radius: 4px;
        box-shadow: 0 4px 15px ${props.theme?.brand?.primary || '#00adef'}33;
    `}

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover {
        transform: translateY(-2px);
        ${props => props.$isUser ? css`
            box-shadow: 0 8px 25px ${props.theme?.brand?.primary || '#00adef'}66;
        ` : css`
            box-shadow: 0 8px 25px ${props.theme?.brand?.primary || '#00adef'}4D;
        `}
    }
`;

const MessageActions = styled.div`
    display: flex;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    ${Message}:hover & {
        opacity: 1;
    }
`;

const ActionButton = styled.button`
    padding: 0.4rem 0.8rem;
    background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}4D;
    border-radius: 6px;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme?.brand?.primary || '#00adef'}33;
        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const InputArea = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 1rem;
    border: 2px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    display: flex;
    gap: 1rem;
    align-items: center;
    transition: all 0.3s ease;

    &:focus-within {
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        box-shadow: 0 0 20px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }
`;

const Input = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    background: rgba(10, 14, 39, 0.8);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}4D;
    border-radius: 8px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    transition: all 0.3s ease;

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }

    &:focus {
        outline: none;
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
        box-shadow: 0 0 0 3px ${props => props.theme?.brand?.primary || '#00adef'}33;
        transform: scale(1.01);
    }
`;

const SendButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px ${props => props.theme?.brand?.primary || '#00adef'}80;
    }

    &:active:not(:disabled) {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const TypingIndicator = styled.div`
    display: flex;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 12px;
    border-bottom-left-radius: 4px;
    max-width: 70%;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Dot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.theme?.brand?.primary || '#00adef'};
    
    ${props => css`
        animation: ${bounce} 1.4s ease-in-out infinite;
        animation-delay: ${props.delay}s;
    `}
`;

const ThinkingAnimation = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 0.9rem;
`;

const BrainIcon = styled(Brain)`
    animation: ${pulse} 2s ease-in-out infinite;
`;

const SuggestionChips = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 0 1rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const Chip = styled.button`
    padding: 0.6rem 1.2rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}1A 0%, ${props => props.theme?.brand?.accent || '#8b5cf6'}1A 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}4D;
    border-radius: 20px;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.brand?.accent || '#8b5cf6'}33 100%);
        transform: translateY(-3px);
        box-shadow: 0 4px 15px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }
`;

const ErrorMessage = styled.div`
    background: linear-gradient(135deg, ${props => props.theme?.error || '#ef4444'}26 0%, ${props => props.theme?.error || '#dc2626'}26 100%);
    border: 1px solid ${props => props.theme?.error || '#ef4444'}4D;
    color: ${props => props.theme?.error || '#ef4444'};
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    animation: ${fadeIn} 0.3s ease-out;
    white-space: pre-wrap;
`;

const WelcomeCard = styled.div`
    background: linear-gradient(135deg, ${props => props.theme?.brand?.accent || '#8b5cf6'}26 0%, ${props => props.theme?.info || '#3b82f6'}26 100%);
    backdrop-filter: blur(10px);
    border: 2px solid ${props => props.theme?.brand?.accent || '#8b5cf6'}4D;
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
`;

const WelcomeTitle = styled.h2`
    font-size: 2rem;
    color: ${props => props.theme?.brand?.accent || '#8b5cf6'};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-shadow: 0 0 20px ${props => props.theme?.brand?.accent || '#8b5cf6'}60;
`;

const WelcomeText = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1.5rem;
`;

const FeatureCard = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}33;
    border-radius: 12px;
    padding: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-5px);
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        box-shadow: 0 10px 30px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }
`;

const FeatureIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${props => props.gradient};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.75rem;
    animation: ${float} 3s ease-in-out infinite;
`;

const FeatureTitle = styled.h3`
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 1rem;
    margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 0.85rem;
    line-height: 1.4;
`;

const ScrollToBottom = styled.button`
    position: absolute;
    bottom: 120px;
    right: 2rem;
    width: 48px;
    height: 48px;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #0088cc 100%)'};
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px ${props => props.theme?.brand?.primary || '#00adef'}66;
    transition: all 0.3s ease;
    z-index: 10;
    animation: ${bounce} 2s ease-in-out infinite;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px ${props => props.theme?.brand?.primary || '#00adef'}99;
    }

    ${props => !props.$show && css`
        opacity: 0;
        pointer-events: none;
    `}
`;

// ============ COMPONENT ============
const ChatPage = () => {
    const { api } = useAuth();
    const { theme } = useTheme();
    const { hasAIChat, canUseFeature, getRequiredPlan } = useSubscription();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [particlesData, setParticlesData] = useState([]);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(!canUseFeature('hasAIChat'));
    const messagesEndRef = useRef(null);
    const messagesAreaRef = useRef(null);

    // Theme colors
    const primaryColor = theme?.brand?.primary || '#00adef';
    const accentColor = theme?.brand?.accent || '#8b5cf6';
    const successColor = theme?.success || '#10b981';

    const suggestions = [
        { icon: TrendingUp, text: "Should I buy AAPL right now?" },
        { icon: Flame, text: "What's happening with NVDA?" },
        { icon: Stars, text: "Best tech stocks to invest in?" },
        { icon: Brain, text: "Explain what RSI means" },
        { icon: Rocket, text: "Is the market bullish or bearish?" }
    ];

    useEffect(() => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            color: [primaryColor, accentColor, successColor][Math.floor(Math.random() * 3)]
        }));
        setParticlesData(newParticles);
    }, [primaryColor, accentColor, successColor]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleScroll = () => {
        if (messagesAreaRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesAreaRef.current;
            setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
        }
    };

    useEffect(() => {
        const messagesArea = messagesAreaRef.current;
        if (messagesArea) {
            messagesArea.addEventListener('scroll', handleScroll);
            return () => messagesArea.removeEventListener('scroll', handleScroll);
        }
    }, []);

    const handleSend = async (messageText = input) => {
        if (!messageText.trim() || loading) return;

        const userMessage = messageText.trim();
        setInput('');
        setError(null);

        const newUserMessage = {
            role: 'user',
            content: userMessage
        };
        
        setMessages(prev => [...prev, newUserMessage]);
        setLoading(true);

        try {
            const conversationHistory = messages.slice(-10);

            const response = await api.post('/chat/message', {
                message: userMessage,
                conversationHistory: conversationHistory
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.response
            }]);

        } catch (err) {
            console.error('❌ Chat error:', err);
            setError(err.response?.data?.error || 'Failed to get response');
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSend(suggestion);
    };

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <PageContainer theme={theme}>
            {/* Subscription Gate */}
            <UpgradePrompt
                isOpen={showUpgradePrompt}
                onClose={() => setShowUpgradePrompt(false)}
                feature="hasAIChat"
                requiredPlan={getRequiredPlan('hasAIChat')}
            />

            <ParticleContainer>
                {particlesData.map(particle => (
                    <Particle
                        key={particle.id}
                        size={particle.size}
                        left={particle.left}
                        duration={particle.duration}
                        delay={particle.delay}
                        color={particle.color}
                    />
                ))}
            </ParticleContainer>

            <Header theme={theme}>
                <Title theme={theme}>
                    <TitleIcon>
                        <Brain size={40} color={primaryColor} />
                    </TitleIcon>
                    AI Chat Assistant
                    <Sparkles size={24} color={primaryColor} />
                </Title>
                <Subtitle theme={theme}>Ask me anything about stocks, trading, and the market</Subtitle>
                <StatusBadge theme={theme}>
                    <Zap size={16} />
                    AI Online & Ready
                </StatusBadge>
            </Header>

            <ChatContainer>
                {messages.length === 0 && (
                    <>
                        <WelcomeCard theme={theme}>
                            <WelcomeTitle theme={theme}>
                                <Stars size={32} color={accentColor} />
                                Welcome to Nexus AI
                            </WelcomeTitle>
                            <WelcomeText theme={theme}>
                                I'm your personal AI stock market assistant. I can help you analyze stocks, 
                                understand market trends, explain trading concepts, and provide insights 
                                to help you make better investment decisions.
                            </WelcomeText>
                            <FeatureGrid>
                                <FeatureCard theme={theme}>
                                    <FeatureIcon gradient={theme?.brand?.gradient || `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`}>
                                        <TrendingUp size={24} color="white" />
                                    </FeatureIcon>
                                    <FeatureTitle theme={theme}>Stock Analysis</FeatureTitle>
                                    <FeatureDescription theme={theme}>
                                        Get detailed analysis on any stock in real-time
                                    </FeatureDescription>
                                </FeatureCard>
                                <FeatureCard theme={theme}>
                                    <FeatureIcon gradient={`linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`}>
                                        <Brain size={24} color="white" />
                                    </FeatureIcon>
                                    <FeatureTitle theme={theme}>Market Insights</FeatureTitle>
                                    <FeatureDescription theme={theme}>
                                        Understand trends and market movements
                                    </FeatureDescription>
                                </FeatureCard>
                                <FeatureCard theme={theme}>
                                    <FeatureIcon gradient={`linear-gradient(135deg, ${successColor}, ${successColor}cc)`}>
                                        <Rocket size={24} color="white" />
                                    </FeatureIcon>
                                    <FeatureTitle theme={theme}>Trading Tips</FeatureTitle>
                                    <FeatureDescription theme={theme}>
                                        Learn strategies and best practices
                                    </FeatureDescription>
                                </FeatureCard>
                            </FeatureGrid>
                        </WelcomeCard>
                        <SuggestionChips>
                            {suggestions.map((suggestion, index) => {
                                const Icon = suggestion.icon;
                                return (
                                    <Chip theme={theme} key={index} onClick={() => handleSuggestionClick(suggestion.text)}>
                                        <Icon size={16} color={primaryColor} />
                                        {suggestion.text}
                                    </Chip>
                                );
                            })}
                        </SuggestionChips>
                    </>
                )}

                <MessagesArea theme={theme} ref={messagesAreaRef}>
                    {messages.map((message, index) => (
                        <Message key={index} $isUser={message.role === 'user'}>
                            <Avatar theme={theme} $isUser={message.role === 'user'}>
                                {message.role === 'user' ? <User size={24} color="white" /> : <Brain size={24} color="white" />}
                            </Avatar>
                            <MessageContent>
                                <MessageBubble theme={theme} $isUser={message.role === 'user'}>
                                    {message.content}
                                </MessageBubble>
                                {message.role === 'assistant' && (
                                    <MessageActions>
                                        <ActionButton theme={theme} onClick={() => copyToClipboard(message.content, index)}>
                                            <Copy size={14} />
                                            {copiedIndex === index ? 'Copied!' : 'Copy'}
                                        </ActionButton>
                                        <ActionButton theme={theme}>
                                            <ThumbsUp size={14} />
                                        </ActionButton>
                                        <ActionButton theme={theme}>
                                            <ThumbsDown size={14} />
                                        </ActionButton>
                                    </MessageActions>
                                )}
                            </MessageContent>
                        </Message>
                    ))}

                    {loading && (
                        <Message $isUser={false}>
                            <Avatar theme={theme} $isUser={false}>
                                <BrainIcon size={24} color="white" />
                            </Avatar>
                            <MessageContent>
                                <TypingIndicator theme={theme}>
                                    <ThinkingAnimation theme={theme}>
                                        <Sparkles size={16} color={primaryColor} />
                                        Thinking
                                    </ThinkingAnimation>
                                    <Dot theme={theme} delay={0} />
                                    <Dot theme={theme} delay={0.2} />
                                    <Dot theme={theme} delay={0.4} />
                                </TypingIndicator>
                            </MessageContent>
                        </Message>
                    )}

                    <div ref={messagesEndRef} />
                </MessagesArea>

                <ScrollToBottom theme={theme} $show={showScrollButton} onClick={scrollToBottom}>
                    <ChevronDown size={24} />
                </ScrollToBottom>

                {error && (
                    <ErrorMessage theme={theme}>
                        <AlertCircle size={20} />
                        {error}
                    </ErrorMessage>
                )}

                <InputArea theme={theme}>
                    <Input
                        theme={theme}
                        type="text"
                        placeholder="Ask me about stocks, market trends, or investing..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <SendButton theme={theme} onClick={() => handleSend()} disabled={loading || !input.trim()}>
                        <Send size={20} />
                        Send
                    </SendButton>
                </InputArea>
            </ChatContainer>
        </PageContainer>
    );
};

export default ChatPage;