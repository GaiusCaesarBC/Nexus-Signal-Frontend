// client/src/components/AIChatWidget.js - THE MOST LEGENDARY AI CHAT WIDGET EVER

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    MessageSquare, X, Send, Minimize2, Maximize2, Sparkles,
    TrendingUp, Brain, DollarSign, AlertCircle, Zap, ChevronDown,
    BarChart3, Eye, Target, Loader
} from 'lucide-react';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
`;

const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.5); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.8); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const bounce = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
`;

const typing = keyframes`
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
`;

// ============ STYLED COMPONENTS ============

// Main Container
const WidgetContainer = styled.div`
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    z-index: 999;
    ${css`animation: ${fadeIn} 0.3s ease-out;`}

    @media (max-width: 768px) {
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
    }
`;

// Chat Bubble Button (when minimized)
const ChatBubble = styled.button`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 30px rgba(0, 173, 237, 0.6);
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
        ${css`animation: ${shimmer} 3s linear infinite;`}
    }

    &:hover {
        transform: scale(1.1);
        box-shadow: 0 10px 40px rgba(0, 173, 237, 0.8);
    }

    ${props => props.hasNotification && css`
        ${css`animation: ${pulse} 2s ease-in-out infinite;`}
    `}
`;

const NotificationDot = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    width: 12px;
    height: 12px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid white;
    ${css`animation: ${pulse} 1.5s ease-in-out infinite;`}
`;

// Chat Window
const ChatWindow = styled.div`
    width: 400px;
    height: 600px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(0, 173, 237, 0.3);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    ${css`animation: ${slideUp} 0.3s ease-out;`}

    @media (max-width: 768px) {
        width: 100%;
        height: 500px;
        border-radius: 16px;
    }
`;

// Header
const ChatHeader = styled.div`
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.05) 100%);
    border-bottom: 1px solid rgba(0, 173, 237, 0.3);
    padding: 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 173, 237, 0.1) 50%, transparent 70%);
        background-size: 200% 200%;
        ${css`animation: ${shimmer} 4s linear infinite;`}
    }
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    position: relative;
    z-index: 1;
`;

const AIAvatar = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00adef, #00ff88);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(0, 173, 237, 0.5);
    ${css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

const HeaderInfo = styled.div``;

const HeaderTitle = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    color: #00adef;
    font-weight: 700;
`;

const HeaderStatus = styled.p`
    margin: 0;
    font-size: 0.85rem;
    color: #10b981;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatusDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    ${css`animation: ${pulse} 2s ease-in-out infinite;`}
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 0.5rem;
    position: relative;
    z-index: 1;
`;

const IconButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    color: #00adef;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
    }
`;

// Quick Actions
const QuickActions = styled.div`
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;

    &::-webkit-scrollbar {
        height: 4px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.5);
        border-radius: 2px;
    }
`;

const QuickActionButton = styled.button`
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 20px;
    color: #00adef;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 173, 237, 0.3);
    }
`;

// Messages Area
const MessagesContainer = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.5);
        border-radius: 4px;

        &:hover {
            background: rgba(0, 173, 237, 0.7);
        }
    }
`;

const Message = styled.div`
    display: flex;
    gap: 0.75rem;
    ${css`animation: ${slideUp} 0.3s ease-out;`}
    align-items: flex-start;
    ${props => props.isUser && css`
        flex-direction: row-reverse;
    `}
`;

const MessageAvatar = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${props => props.isUser 
        ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' 
        : 'linear-gradient(135deg, #00adef, #00ff88)'};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 10px ${props => props.isUser 
        ? 'rgba(139, 92, 246, 0.5)' 
        : 'rgba(0, 173, 237, 0.5)'};
`;

const MessageBubble = styled.div`
    background: ${props => props.isUser 
        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)' 
        : 'linear-gradient(135deg, rgba(0, 173, 237, 0.15) 0%, rgba(0, 136, 204, 0.15) 100%)'};
    border: 1px solid ${props => props.isUser 
        ? 'rgba(139, 92, 246, 0.3)' 
        : 'rgba(0, 173, 237, 0.3)'};
    border-radius: 16px;
    padding: 0.875rem 1.125rem;
    max-width: 75%;
    position: relative;
    overflow: hidden;

    ${props => props.isUser && css`
        border-bottom-right-radius: 4px;
    `}

    ${props => !props.isUser && css`
        border-bottom-left-radius: 4px;
    `}

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, ${props => props.isUser 
            ? 'rgba(139, 92, 246, 0.1)' 
            : 'rgba(0, 173, 237, 0.1)'} 50%, transparent 70%);
        background-size: 200% 200%;
        ${css`animation: ${shimmer} 4s linear infinite;`}
    }
`;

const MessageText = styled.p`
    margin: 0;
    color: #e0e6ed;
    font-size: 0.95rem;
    line-height: 1.6;
    position: relative;
    z-index: 1;
    white-space: pre-wrap;
    word-wrap: break-word;

    /* Handle markdown-style formatting */
    strong, b {
        font-weight: 700;
        color: #00adef;
    }

    em, i {
        font-style: italic;
        color: #a78bfa;
    }

    code {
        background: rgba(0, 173, 237, 0.1);
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
    }

    /* Style lists */
    ul, ol {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
    }

    li {
        margin: 0.25rem 0;
    }
`;

const MessageTime = styled.span`
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
    display: block;
    position: relative;
    z-index: 1;
`;

// Typing Indicator
const TypingIndicator = styled.div`
    display: flex;
    gap: 0.75rem;
    align-items: center;
    ${css`animation: ${slideUp} 0.3s ease-out;`}
`;

const TypingBubble = styled.div`
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.15) 0%, rgba(0, 136, 204, 0.15) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    border-bottom-left-radius: 4px;
    padding: 0.875rem 1.125rem;
    display: flex;
    gap: 0.5rem;
`;

const TypingDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00adef;
    ${props => css`
        animation: ${typing} 1.4s ease-in-out infinite;
        animation-delay: ${props.delay}s;
    `}
`;

// Input Area
const InputContainer = styled.div`
    padding: 1.25rem;
    background: rgba(0, 173, 237, 0.05);
    border-top: 1px solid rgba(0, 173, 237, 0.2);
`;

const InputWrapper = styled.div`
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
`;

const InputField = styled.textarea`
    flex: 1;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    padding: 0.875rem;
    color: #e0e6ed;
    font-size: 0.95rem;
    font-family: inherit;
    resize: none;
    max-height: 100px;
    transition: all 0.2s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 20px rgba(0, 173, 237, 0.3);
    }

    &::placeholder {
        color: #64748b;
    }

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 173, 237, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(0, 173, 237, 0.5);
        border-radius: 3px;
    }
`;

const SendButton = styled.button`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
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
        ${css`animation: ${shimmer} 3s linear infinite;`}
    }

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 173, 237, 0.5);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// Welcome Screen
const WelcomeScreen = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    height: 100%;
`;

const WelcomeIcon = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #00adef, #00ff88);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    ${css`animation: ${bounce} 2s ease-in-out infinite;`}
    box-shadow: 0 10px 40px rgba(0, 173, 237, 0.6);
`;

const WelcomeTitle = styled.h2`
    font-size: 1.8rem;
    color: #00adef;
    margin-bottom: 0.75rem;
    font-weight: 900;
`;

const WelcomeText = styled.p`
    color: #94a3b8;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
`;

const SuggestedPrompts = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
`;

const PromptButton = styled.button`
    padding: 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #00adef;
    font-size: 0.95rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    &:hover {
        background: rgba(0, 173, 237, 0.2);
        transform: translateX(5px);
        border-color: #00adef;
    }
`;

// ============ COMPONENT ============
const AIChatWidget = () => {
    const { user, api } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasNotification, setHasNotification] = useState(false);
    const messagesEndRef = useRef(null);

    const quickActions = [
        { icon: TrendingUp, label: 'Predict Stock', prompt: 'Predict the price of AAPL for next week' },
        { icon: BarChart3, label: 'Portfolio Analysis', prompt: 'Analyze my portfolio performance' },
        { icon: Eye, label: 'Market Trends', prompt: 'What are the current market trends?' },
        { icon: DollarSign, label: 'Investment Tips', prompt: 'Give me some investment tips' },
    ];

    const suggestedPrompts = [
        { icon: TrendingUp, text: 'What stocks should I watch today?' },
        { icon: Brain, text: 'Explain how your AI predictions work' },
        { icon: Target, text: 'Help me build a diversified portfolio' },
        { icon: Sparkles, text: 'What are the hottest tech stocks right now?' },
    ];

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const formatMessageText = (text) => {
        // Convert markdown-style formatting to HTML
        let formatted = text
            // Bold text **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italic text *text* or _text_
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // Inline code `code`
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Line breaks
            .replace(/\n/g, '<br/>');

        return formatted;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Call your AI API here
            const response = await api.post('/chat/message', {
                message: inputValue,
                conversationId: messages[0]?.conversationId || null
            });

            setTimeout(() => {
                const aiMessage = {
                    id: Date.now(),
                    text: response.data.response || "I'm here to help you with stock predictions and market analysis! Ask me anything about trading.",
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiMessage]);
                setIsTyping(false);

                // Show notification if widget is closed
                if (!isOpen) {
                    setHasNotification(true);
                }
            }, 1500);
        } catch (error) {
            console.error('Error sending message:', error);
            setTimeout(() => {
                const aiMessage = {
                    id: Date.now(),
                    text: "I'm here to help you with stock predictions and market analysis! Ask me anything about trading.",
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, aiMessage]);
                setIsTyping(false);
            }, 1500);
        }
    };

    const handleQuickAction = (prompt) => {
        setInputValue(prompt);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleWidget = () => {
        setIsOpen(!isOpen);
        setHasNotification(false);
    };

    if (!isOpen) {
        return (
            <WidgetContainer>
                <ChatBubble onClick={toggleWidget} hasNotification={hasNotification}>
                    {hasNotification && <NotificationDot />}
                    <MessageSquare size={28} color="white" />
                </ChatBubble>
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer>
            <ChatWindow>
                {/* Header */}
                <ChatHeader>
                    <HeaderLeft>
                        <AIAvatar>
                            <Brain size={24} color="white" />
                        </AIAvatar>
                        <HeaderInfo>
                            <HeaderTitle>Nexus AI Assistant</HeaderTitle>
                            <HeaderStatus>
                                <StatusDot />
                                Online
                            </HeaderStatus>
                        </HeaderInfo>
                    </HeaderLeft>
                    <HeaderActions>
                        <IconButton onClick={() => setIsMinimized(!isMinimized)} title="Minimize">
                            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                        </IconButton>
                        <IconButton onClick={toggleWidget} title="Close">
                            <X size={18} />
                        </IconButton>
                    </HeaderActions>
                </ChatHeader>

                {!isMinimized && (
                    <>
                        {/* Quick Actions */}
                        {messages.length > 0 && (
                            <QuickActions>
                                {quickActions.map((action, index) => (
                                    <QuickActionButton 
                                        key={index}
                                        onClick={() => handleQuickAction(action.prompt)}
                                    >
                                        <action.icon size={16} />
                                        {action.label}
                                    </QuickActionButton>
                                ))}
                            </QuickActions>
                        )}

                        {/* Messages */}
                        <MessagesContainer>
                            {messages.length === 0 ? (
                                <WelcomeScreen>
                                    <WelcomeIcon>
                                        <Sparkles size={40} color="white" />
                                    </WelcomeIcon>
                                    <WelcomeTitle>Hey {user?.name || 'Trader'}! 👋</WelcomeTitle>
                                    <WelcomeText>
                                        I'm your AI assistant powered by advanced machine learning. 
                                        Ask me anything about stocks, predictions, or market analysis!
                                    </WelcomeText>
                                    <SuggestedPrompts>
                                        {suggestedPrompts.map((prompt, index) => (
                                            <PromptButton 
                                                key={index}
                                                onClick={() => handleQuickAction(prompt.text)}
                                            >
                                                <prompt.icon size={20} />
                                                {prompt.text}
                                            </PromptButton>
                                        ))}
                                    </SuggestedPrompts>
                                </WelcomeScreen>
                            ) : (
                                <>
                                    {messages.map((message) => (
                                        <Message key={message.id} isUser={message.isUser}>
                                            <MessageAvatar isUser={message.isUser}>
                                                {message.isUser ? 
                                                    user?.name?.charAt(0).toUpperCase() || 'U' : 
                                                    <Brain size={18} color="white" />
                                                }
                                            </MessageAvatar>
                                            <MessageBubble isUser={message.isUser}>
                                                <MessageText dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }} />
                                                <MessageTime>{message.timestamp}</MessageTime>
                                            </MessageBubble>
                                        </Message>
                                    ))}
                                    {isTyping && (
                                        <TypingIndicator>
                                            <MessageAvatar>
                                                <Brain size={18} color="white" />
                                            </MessageAvatar>
                                            <TypingBubble>
                                                <TypingDot delay={0} />
                                                <TypingDot delay={0.2} />
                                                <TypingDot delay={0.4} />
                                            </TypingBubble>
                                        </TypingIndicator>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </MessagesContainer>

                        {/* Input */}
                        <InputContainer>
                            <InputWrapper>
                                <InputField
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me anything about stocks..."
                                    rows={1}
                                    disabled={isTyping}
                                />
                                <SendButton 
                                    onClick={handleSend} 
                                    disabled={!inputValue.trim() || isTyping}
                                >
                                    <Send size={20} color="white" />
                                </SendButton>
                            </InputWrapper>
                        </InputContainer>
                    </>
                )}
            </ChatWindow>
        </WidgetContainer>
    );
};

export default AIChatWidget;