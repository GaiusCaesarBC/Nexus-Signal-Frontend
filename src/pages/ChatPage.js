// client/src/pages/ChatPage.js - THE MOST LEGENDARY AI CHAT PAGE
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
    Send, Brain, User, Sparkles, TrendingUp, AlertCircle, 
    Zap, MessageSquare, Stars, Rocket, Flame, ChevronDown,
    Copy, ThumbsUp, ThumbsDown, RotateCcw, Volume2
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

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.4); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.8); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
`;

const particles = keyframes`
    0% { transform: translateY(0) translateX(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100vh) translateX(50px) scale(0); opacity: 0; }
`;

const waveAnimation = keyframes`
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.5); }
`;

const neonGlow = keyframes`
    0%, 100% {
        text-shadow: 
            0 0 10px rgba(0, 173, 237, 0.8),
            0 0 20px rgba(0, 173, 237, 0.6),
            0 0 30px rgba(0, 173, 237, 0.4);
    }
    50% {
        text-shadow: 
            0 0 20px rgba(0, 173, 237, 1),
            0 0 40px rgba(0, 173, 237, 0.8),
            0 0 60px rgba(0, 173, 237, 0.6);
    }
`;

const typing = keyframes`
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    position: relative;
    overflow: hidden;
`;

// Animated background particles
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
    animation: ${particles} ${props => props.duration}s linear infinite;
    animation-delay: ${props => props.delay}s;
    left: ${props => props.left}%;
    opacity: 0.6;
    filter: blur(1px);
`;

const Header = styled.div`
    padding: 2rem;
    text-align: center;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 173, 237, 0.2);
    position: relative;
    z-index: 1;
    animation: ${fadeIn} 0.6s ease-out;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    color: #00adef;
    margin-bottom: 0.5rem;
    animation: ${neonGlow} 2s ease-in-out infinite;
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
    color: #94a3b8;
    font-size: 1.1rem;
`;

const StatusBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: 20px;
    font-size: 0.9rem;
    color: #10b981;
    margin-top: 1rem;
    animation: ${glow} 3s ease-in-out infinite;
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

    /* Custom scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.3);
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 173, 237, 0.5);
    }
`;

const Message = styled.div`
    display: flex;
    gap: 1rem;
    animation: ${props => props.isUser ? slideInRight : slideInLeft} 0.5s ease-out;
    align-items: flex-start;
    ${props => props.isUser && `
        flex-direction: row-reverse;
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
    ${props => props.isUser ? `
        background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
        box-shadow: 0 4px 15px rgba(0, 173, 237, 0.4);
    ` : `
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
        animation: ${float} 3s ease-in-out infinite;
    `}
    transition: transform 0.3s ease;

    &:hover {
        transform: scale(1.1) rotate(5deg);
    }

    &::after {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        background: #10b981;
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
    ${props => props.isUser ? `
        background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
        color: white;
        border-bottom-right-radius: 4px;
        box-shadow: 0 4px 15px rgba(0, 173, 237, 0.3);
    ` : `
        background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 173, 237, 0.2);
        color: #e0e6ed;
        border-bottom-left-radius: 4px;
        box-shadow: 0 4px 15px rgba(0, 173, 237, 0.2);
    `}
    line-height: 1.6;
    word-wrap: break-word;
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
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite;
    }

    &:hover {
        transform: translateY(-2px);
        ${props => props.isUser ? `
            box-shadow: 0 8px 25px rgba(0, 173, 237, 0.4);
        ` : `
            box-shadow: 0 8px 25px rgba(0, 173, 237, 0.3);
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
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 6px;
    color: #00adef;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
    }
`;

const InputArea = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 1rem;
    border: 2px solid rgba(0, 173, 237, 0.2);
    display: flex;
    gap: 1rem;
    align-items: center;
    transition: all 0.3s ease;

    &:focus-within {
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 0 20px rgba(0, 173, 237, 0.3);
    }
`;

const Input = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    background: rgba(10, 14, 39, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 8px;
    color: #e0e6ed;
    font-size: 1rem;
    transition: all 0.3s ease;

    &::placeholder {
        color: #64748b;
    }

    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
        transform: scale(1.01);
    }
`;

const SendButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
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
        box-shadow: 0 8px 20px rgba(0, 173, 237, 0.5);
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
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    border-bottom-left-radius: 4px;
    max-width: 70%;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Dot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00adef;
    animation: ${bounce} 1.4s ease-in-out infinite;
    animation-delay: ${props => props.delay}s;
`;

const ThinkingAnimation = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #00adef;
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
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    color: #00adef;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
        transform: translateY(-3px);
        box-shadow: 0 4px 15px rgba(0, 173, 237, 0.3);
    }
`;

const ErrorMessage = styled.div`
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const WelcomeCard = styled.div`
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    animation: ${fadeIn} 0.8s ease-out;
    text-align: center;
`;

const WelcomeTitle = styled.h2`
    font-size: 2rem;
    color: #8b5cf6;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    animation: ${neonGlow} 2s ease-in-out infinite;
`;

const WelcomeText = styled.p`
    color: #94a3b8;
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
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-5px);
        border-color: rgba(0, 173, 237, 0.5);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
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
    color: #00adef;
    font-size: 1rem;
    margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
    color: #94a3b8;
    font-size: 0.85rem;
    line-height: 1.4;
`;

const ScrollToBottom = styled.button`
    position: absolute;
    bottom: 120px;
    right: 2rem;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0, 173, 237, 0.4);
    transition: all 0.3s ease;
    z-index: 10;
    animation: ${bounce} 2s ease-in-out infinite;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0, 173, 237, 0.6);
    }

    ${props => !props.show && `
        opacity: 0;
        pointer-events: none;
    `}
`;

// ============ COMPONENT ============
const ChatPage = () => {
    const { api } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [particles, setParticles] = useState([]);
    const messagesEndRef = useRef(null);
    const messagesAreaRef = useRef(null);

    const suggestions = [
        { icon: TrendingUp, text: "Should I buy AAPL right now?" },
        { icon: Flame, text: "What's happening with NVDA?" },
        { icon: Stars, text: "Best tech stocks to invest in?" },
        { icon: Brain, text: "Explain what RSI means" },
        { icon: Rocket, text: "Is the market bullish or bearish?" }
    ];

    // Generate background particles on mount
    useEffect(() => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: Math.random() * 100,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
            color: ['#00adef', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 3)]
        }));
        setParticles(newParticles);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Handle scroll to show/hide scroll button
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

        // Add user message to chat
        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage
        }]);

        setLoading(true);

        try {
            // Get conversation history (last 10 messages for context)
            const conversationHistory = messages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // TODO: Get user context (portfolio, watchlist, predictions)
            const userContext = {
                portfolio: [],
                watchlist: [],
                recentPredictions: []
            };

            const response = await api.post('/chat/message', {
                message: userMessage,
                conversationHistory,
                userContext
            });

            // Add assistant response
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.message
            }]);

        } catch (err) {
            console.error('Chat error:', err);
            setError(err.response?.data?.error || 'Failed to get response. Please try again.');
            
            // Remove the user message if request failed
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    return (
        <PageContainer>
            {/* Animated Background Particles */}
            <ParticleContainer>
                {particles.map(particle => (
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

            <Header>
                <Title>
                    <TitleIcon>
                        <Brain size={40} />
                    </TitleIcon>
                    AI Chat Assistant
                    <Sparkles size={24} />
                </Title>
                <Subtitle>Ask me anything about stocks, trading, and the market</Subtitle>
                <StatusBadge>
                    <Zap size={16} />
                    AI Online & Ready
                </StatusBadge>
            </Header>

            <ChatContainer>
                {messages.length === 0 && (
                    <>
                        <WelcomeCard>
                            <WelcomeTitle>
                                <Stars size={32} />
                                Welcome to Nexus AI
                            </WelcomeTitle>
                            <WelcomeText>
                                I'm your personal AI stock market assistant. I can help you analyze stocks, 
                                understand market trends, explain trading concepts, and provide insights 
                                to help you make better investment decisions.
                            </WelcomeText>
                            <FeatureGrid>
                                <FeatureCard>
                                    <FeatureIcon gradient="linear-gradient(135deg, #00adef, #0088cc)">
                                        <TrendingUp size={24} />
                                    </FeatureIcon>
                                    <FeatureTitle>Stock Analysis</FeatureTitle>
                                    <FeatureDescription>
                                        Get detailed analysis on any stock in real-time
                                    </FeatureDescription>
                                </FeatureCard>
                                <FeatureCard>
                                    <FeatureIcon gradient="linear-gradient(135deg, #8b5cf6, #6366f1)">
                                        <Brain size={24} />
                                    </FeatureIcon>
                                    <FeatureTitle>Market Insights</FeatureTitle>
                                    <FeatureDescription>
                                        Understand trends and market movements
                                    </FeatureDescription>
                                </FeatureCard>
                                <FeatureCard>
                                    <FeatureIcon gradient="linear-gradient(135deg, #10b981, #059669)">
                                        <Rocket size={24} />
                                    </FeatureIcon>
                                    <FeatureTitle>Trading Tips</FeatureTitle>
                                    <FeatureDescription>
                                        Learn strategies and best practices
                                    </FeatureDescription>
                                </FeatureCard>
                            </FeatureGrid>
                        </WelcomeCard>
                        <SuggestionChips>
                            {suggestions.map((suggestion, index) => {
                                const Icon = suggestion.icon;
                                return (
                                    <Chip key={index} onClick={() => handleSuggestionClick(suggestion.text)}>
                                        <Icon size={16} />
                                        {suggestion.text}
                                    </Chip>
                                );
                            })}
                        </SuggestionChips>
                    </>
                )}

                <MessagesArea ref={messagesAreaRef}>
                    {messages.map((message, index) => (
                        <Message key={index} isUser={message.role === 'user'}>
                            <Avatar isUser={message.role === 'user'}>
                                {message.role === 'user' ? <User size={24} /> : <Brain size={24} />}
                            </Avatar>
                            <MessageContent>
                                <MessageBubble isUser={message.role === 'user'}>
                                    {message.content}
                                </MessageBubble>
                                {message.role === 'assistant' && (
                                    <MessageActions>
                                        <ActionButton onClick={() => copyToClipboard(message.content)}>
                                            <Copy size={14} />
                                            Copy
                                        </ActionButton>
                                        <ActionButton>
                                            <ThumbsUp size={14} />
                                        </ActionButton>
                                        <ActionButton>
                                            <ThumbsDown size={14} />
                                        </ActionButton>
                                    </MessageActions>
                                )}
                            </MessageContent>
                        </Message>
                    ))}

                    {loading && (
                        <Message isUser={false}>
                            <Avatar isUser={false}>
                                <BrainIcon size={24} />
                            </Avatar>
                            <MessageContent>
                                <TypingIndicator>
                                    <ThinkingAnimation>
                                        <Sparkles size={16} />
                                        Thinking
                                    </ThinkingAnimation>
                                    <Dot delay={0} />
                                    <Dot delay={0.2} />
                                    <Dot delay={0.4} />
                                </TypingIndicator>
                            </MessageContent>
                        </Message>
                    )}

                    <div ref={messagesEndRef} />
                </MessagesArea>

                <ScrollToBottom show={showScrollButton} onClick={scrollToBottom}>
                    <ChevronDown size={24} />
                </ScrollToBottom>

                {error && (
                    <ErrorMessage>
                        <AlertCircle size={20} />
                        {error}
                    </ErrorMessage>
                )}

                <InputArea>
                    <Input
                        type="text"
                        placeholder="Ask me about stocks, market trends, or investing..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <SendButton onClick={() => handleSend()} disabled={loading || !input.trim()}>
                        <Send size={20} />
                        Send
                    </SendButton>
                </InputArea>
            </ChatContainer>
        </PageContainer>
    );
};

export default ChatPage;