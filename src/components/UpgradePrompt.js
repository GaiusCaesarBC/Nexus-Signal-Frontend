// client/src/components/UpgradePrompt.js - Feature Gating Modal

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useSubscription } from '../context/SubscriptionContext';

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
    background: linear-gradient(135deg, #1a1f3a 0%, #0d1127 100%);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    width: 90%;
    text-align: center;
    animation: ${slideUp} 0.3s ease-out;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
                0 0 40px rgba(0, 212, 255, 0.1);
`;

const IconWrapper = styled.div`
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(120, 0, 255, 0.2));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    font-size: 40px;
`;

const Title = styled.h2`
    color: #fff;
    font-size: 1.8rem;
    margin: 0 0 12px;
    background: linear-gradient(135deg, #00d4ff, #7b2dff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const Description = styled.p`
    color: #8892b0;
    font-size: 1rem;
    line-height: 1.6;
    margin: 0 0 24px;
`;

const PlanBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${props => {
        switch(props.plan) {
            case 'starter': return 'linear-gradient(135deg, #4ade80, #22c55e)';
            case 'pro': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
            case 'premium': return 'linear-gradient(135deg, #a855f7, #9333ea)';
            case 'elite': return 'linear-gradient(135deg, #f59e0b, #d97706)';
            default: return 'linear-gradient(135deg, #64748b, #475569)';
        }
    }};
    color: white;
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 24px;
`;

const FeatureList = styled.ul`
    text-align: left;
    list-style: none;
    padding: 0;
    margin: 0 0 30px;
`;

const FeatureItem = styled.li`
    color: #a8b2d1;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    gap: 12px;

    &:last-child {
        border-bottom: none;
    }

    svg, span.icon {
        color: #00d4ff;
        font-size: 1.2rem;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
`;

const UpgradeButton = styled.button`
    background: linear-gradient(135deg, #00d4ff, #7b2dff);
    color: white;
    border: none;
    padding: 14px 32px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
    }
`;

const CloseButton = styled.button`
    background: transparent;
    color: #8892b0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 14px 24px;
    border-radius: 12px;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
    }
`;

const CurrentPlan = styled.div`
    color: #64748b;
    font-size: 0.85rem;
    margin-top: 20px;
`;

// Feature descriptions for different features
// IMPORTANT: Keep in sync with SubscriptionContext.js and PricingPage.js!
const FEATURE_INFO = {
    // NEXUS AI - Premium/Elite
    hasNexusAI: {
        icon: '✨',
        title: 'NEXUS AI Chart Indicator',
        description: 'Visualize AI-powered price predictions directly on your charts with projected target lines extending into the future.',
        benefits: [
            'See AI price targets on charts',
            'Visual projection lines into the future',
            'Blue/orange indicators for UP/DOWN',
            'Confidence levels and timeframes',
            'Works with stocks and crypto'
        ]
    },
    // AI Chat - Pro+
    hasAIChat: {
        icon: '🤖',
        title: 'AI Chat Assistant',
        description: 'Get instant market insights and trading advice from our advanced AI assistant powered by Claude.',
        benefits: [
            'Ask questions about any stock or crypto',
            'Get personalized trading suggestions',
            'Real-time market analysis',
            'Portfolio optimization tips'
        ]
    },
    // GPT-4 Chat - Premium/Elite
    hasAIChatGPT4: {
        icon: '🧠',
        title: 'GPT-4 Turbo AI Chat',
        description: 'Access our most powerful AI model for in-depth market analysis and complex trading questions.',
        benefits: [
            'Most advanced AI reasoning',
            'Deeper market analysis',
            'Complex strategy discussions',
            'Enhanced accuracy'
        ]
    },
    // Price Alerts - Pro+
    hasPriceAlerts: {
        icon: '🔔',
        title: 'Real-Time Price Alerts',
        description: 'Set custom price alerts and never miss a trading opportunity.',
        benefits: [
            'Real-time notifications',
            'Email and push alerts',
            'Multi-asset support',
            'Percentage-based triggers'
        ]
    },
    // Custom Alerts - Premium/Elite
    hasCustomAlerts: {
        icon: '🎯',
        title: 'Custom Price Alerts',
        description: 'Create advanced custom alerts with complex conditions.',
        benefits: [
            'Multi-condition alerts',
            'Technical indicator triggers',
            'Volume-based alerts',
            'Webhook integrations'
        ]
    },
    // Daily Signals/Predictions
    dailySignals: {
        icon: '📊',
        title: 'AI Predictions',
        description: 'Access AI-powered price predictions for stocks and crypto.',
        benefits: [
            'Machine learning predictions',
            'Technical indicator analysis',
            'Confidence scores',
            'Multiple timeframes'
        ]
    },
    // Watchlist
    watchlistAssets: {
        icon: '👀',
        title: 'Watchlist',
        description: 'Track your favorite stocks and cryptocurrencies.',
        benefits: [
            'Real-time price updates',
            'Quick access to analysis',
            'Custom organization',
            'Price change alerts'
        ]
    },
    // Screener - Starter+
    hasScreener: {
        icon: '🔍',
        title: 'Stock Screener',
        description: 'Find trading opportunities with our advanced screener.',
        benefits: [
            'Custom filters',
            'Real-time data',
            'Technical indicators',
            'Save filter presets'
        ]
    },
    // News Feed - Starter+
    hasNewsFeed: {
        icon: '📰',
        title: 'Market News Feed',
        description: 'Stay updated with real-time market news and analysis.',
        benefits: [
            'Breaking market news',
            'Earnings announcements',
            'SEC filings alerts',
            'Curated stock news'
        ]
    },
    // Sentiment Analysis - Starter+
    hasSentimentAnalysis: {
        icon: '😊',
        title: 'Sentiment Analysis',
        description: 'Gauge market sentiment with our AI-powered analysis.',
        benefits: [
            'Social media sentiment',
            'News sentiment scores',
            'Bullish/bearish indicators',
            'Trend detection'
        ]
    },
    // Trade Journal - Starter+
    hasTradeJournal: {
        icon: '📓',
        title: 'Trade Journal',
        description: 'Track and analyze your trading performance.',
        benefits: [
            'Log all your trades',
            'Performance analytics',
            'Win/loss tracking',
            'Strategy notes'
        ]
    },
    // Stock Details - Starter+
    hasStockDetails: {
        icon: '📈',
        title: 'Stock Detail Pages',
        description: 'Access detailed stock information and analysis.',
        benefits: [
            'Company fundamentals',
            'Historical data',
            'Technical charts',
            'Key metrics'
        ]
    },
    // Heatmap - Pro+
    hasHeatmap: {
        icon: '🗺️',
        title: 'Advanced Market Heatmap',
        description: 'Visualize market performance with our interactive heatmap.',
        benefits: [
            'Sector performance',
            'Real-time updates',
            'Custom views',
            'Quick stock access'
        ]
    },
    // Technical Indicators - Pro+
    hasTechnicalIndicators: {
        icon: '📉',
        title: 'Technical Indicators',
        description: 'Access professional-grade technical indicators.',
        benefits: [
            'RSI, MACD, Bollinger Bands',
            'Moving averages',
            'Volume analysis',
            'Custom overlays'
        ]
    },
    // Stock Comparison - Pro+
    hasStockComparison: {
        icon: '⚖️',
        title: 'Stock Comparison Tools',
        description: 'Compare multiple stocks side by side.',
        benefits: [
            'Performance comparison',
            'Fundamental metrics',
            'Technical analysis',
            'Peer analysis'
        ]
    },
    // Advanced Analysis - Pro+
    hasAdvancedAnalysis: {
        icon: '🔬',
        title: 'Advanced Analysis Tools',
        description: 'Access professional-grade analysis tools.',
        benefits: [
            'Deep market analysis',
            'Advanced charting',
            'Custom indicators',
            'Strategy tools'
        ]
    },
    // Prediction History - Premium/Elite
    hasPredictionHistory: {
        icon: '📚',
        title: 'Prediction History',
        description: 'View your complete prediction history and track performance.',
        benefits: [
            'Full prediction archive',
            'Performance tracking',
            'Strategy refinement',
            'Historical insights'
        ]
    },
    // Accuracy Analytics - Premium/Elite
    hasAccuracyAnalytics: {
        icon: '🎯',
        title: 'Accuracy Analytics',
        description: 'Analyze the accuracy of AI predictions in detail.',
        benefits: [
            'Accuracy metrics',
            'Performance trends',
            'Asset-specific stats',
            'Timeframe analysis'
        ]
    },
    // Portfolio Tracking - Premium/Elite
    hasPortfolioTracking: {
        icon: '💼',
        title: 'Portfolio Tracking',
        description: 'Track and optimize your investment portfolio.',
        benefits: [
            'Real-time P/L tracking',
            'Portfolio analytics',
            'Diversification analysis',
            'Performance reports'
        ]
    },
    // Live Data - Premium/Elite
    hasLiveData: {
        icon: '⚡',
        title: 'Live Real-Time Data',
        description: 'Access streaming real-time market data.',
        benefits: [
            'Live price updates',
            'Real-time quotes',
            'Instant notifications',
            'Zero delay data'
        ]
    },
    // Pattern Recognition - Premium/Elite
    hasPatternRecognition: {
        icon: '🔮',
        title: 'Pattern Recognition',
        description: 'AI-powered chart pattern detection.',
        benefits: [
            'Candlestick patterns',
            'Chart formations',
            'Trend identification',
            'Breakout alerts'
        ]
    },
    // Sector Analysis - Premium/Elite
    hasSectorAnalysis: {
        icon: '🏢',
        title: 'Sector Rotation Analysis',
        description: 'Track sector performance and rotation trends.',
        benefits: [
            'Sector performance',
            'Rotation signals',
            'Industry trends',
            'Allocation insights'
        ]
    },
    // Whale Alerts - Premium/Elite
    hasWhaleAlerts: {
        icon: '🐋',
        title: 'Whale Alerts',
        description: 'Track large institutional and insider trading activity.',
        benefits: [
            'Large trade detection',
            'Institutional moves',
            'Smart money tracking',
            'Real-time alerts'
        ]
    },
    // Dark Pool Flow - Premium/Elite
    hasDarkPoolFlow: {
        icon: '🌑',
        title: 'Dark Pool Flow',
        description: 'Monitor dark pool trading activity.',
        benefits: [
            'Dark pool prints',
            'Block trades',
            'Hidden liquidity',
            'Institutional flow'
        ]
    },
    // Institutional Activity - Premium/Elite
    hasInstitutionalActivity: {
        icon: '🏛️',
        title: 'Institutional Activity',
        description: 'Track institutional investor movements.',
        benefits: [
            '13F filings',
            'Hedge fund positions',
            'Institutional buying',
            'Position changes'
        ]
    },
    // Congressional Trades - Premium/Elite
    hasCongressionalTrades: {
        icon: '🏛️',
        title: 'Congressional Trade Alerts',
        description: 'Track stock trades made by members of Congress.',
        benefits: [
            'Senator trades',
            'Representative trades',
            'Filing alerts',
            'Trade history'
        ]
    },
    // Discovery Page - Premium/Elite
    hasDiscoveryPage: {
        icon: '🌟',
        title: 'Discovery Page',
        description: 'Discover top traders and trending predictions.',
        benefits: [
            'Top performers',
            'Trending stocks',
            'Community insights',
            'Follow experts'
        ]
    },
    // API Access - Elite
    hasAPIAccess: {
        icon: '🔌',
        title: 'REST API Access',
        description: 'Full programmatic access to our trading data and signals.',
        benefits: [
            'Complete API access',
            'Webhooks support',
            'Custom integrations',
            'Algorithmic trading'
        ]
    },
    // Ultra-Low Latency - Elite
    hasUltraLowLatency: {
        icon: '⚡',
        title: 'Ultra-Low Latency Data',
        description: 'Get market data with less than 50ms latency.',
        benefits: [
            '<50ms latency',
            'Direct market feeds',
            'Priority data routing',
            'Institutional speed'
        ]
    },
    // Backtesting - Elite
    hasBacktesting: {
        icon: '⏮️',
        title: 'Strategy Backtesting',
        description: 'Test trading strategies against historical data.',
        benefits: [
            'Historical testing',
            'Strategy validation',
            'Performance metrics',
            'Risk analysis'
        ]
    },
    // Institutional Analytics - Elite
    hasInstitutionalAnalytics: {
        icon: '📊',
        title: 'Institutional Analytics',
        description: 'Access institutional-grade analytics and insights.',
        benefits: [
            'Professional tools',
            'Advanced metrics',
            'Deep analysis',
            'Institutional data'
        ]
    },
    // Multi-Account - Elite
    hasMultiAccount: {
        icon: '👥',
        title: 'Multi-Account Management',
        description: 'Manage multiple trading accounts from one dashboard.',
        benefits: [
            'Multiple portfolios',
            'Unified dashboard',
            'Account switching',
            'Aggregate analytics'
        ]
    },
    // Custom Research - Elite
    hasCustomResearch: {
        icon: '🔎',
        title: 'Custom Research & Insights',
        description: 'Get personalized research reports and analysis.',
        benefits: [
            'Custom reports',
            'Personalized insights',
            'On-demand analysis',
            'Expert research'
        ]
    },
    // Mentorship - Elite
    hasMentorship: {
        icon: '🎓',
        title: '1-on-1 Trading Mentorship',
        description: 'Get personal guidance from experienced traders.',
        benefits: [
            'Personal mentorship',
            'Strategy coaching',
            'Trading guidance',
            'Expert advice'
        ]
    },
    // White Label - Elite
    hasWhiteLabel: {
        icon: '🏷️',
        title: 'White-Label Options',
        description: 'Rebrand our platform for your business.',
        benefits: [
            'Custom branding',
            'Your own platform',
            'Client management',
            'Revenue sharing'
        ]
    },
    // Dedicated Manager - Elite
    hasDedicatedManager: {
        icon: '👔',
        title: 'Dedicated Account Manager',
        description: 'Get a personal account manager for priority support.',
        benefits: [
            'Personal contact',
            'Priority support',
            'Direct line',
            'Proactive help'
        ]
    },
    // VIP Community - Elite
    hasVIPCommunity: {
        icon: '👑',
        title: 'VIP Discord Community',
        description: 'Join our exclusive community of elite traders.',
        benefits: [
            'Exclusive access',
            'Expert discussions',
            'Private channels',
            'Networking'
        ]
    },
    // Whale Webhooks - Elite
    hasWhaleWebhooks: {
        icon: '🔗',
        title: 'Whale Alert Webhooks',
        description: 'Get whale alerts via API and webhooks.',
        benefits: [
            'Real-time webhooks',
            'Custom integrations',
            'Automated alerts',
            'API access'
        ]
    },
    // Early Access - Elite
    hasEarlyAccess: {
        icon: '🚀',
        title: 'Early Access',
        description: 'Be the first to try new features.',
        benefits: [
            'Beta features',
            'Priority access',
            'Feature voting',
            'Direct feedback'
        ]
    },
    // Default fallback
    default: {
        icon: '⭐',
        title: 'Premium Feature',
        description: 'This feature requires a higher subscription plan.',
        benefits: [
            'Unlock advanced features',
            'Get better trading insights',
            'Access premium tools'
        ]
    }
};

const UpgradePrompt = ({
    isOpen,
    onClose,
    feature = 'default',
    requiredPlan = 'starter',
    customTitle,
    customDescription
}) => {
    const navigate = useNavigate();
    const { currentPlan, getPlanDisplayName } = useSubscription();

    if (!isOpen) return null;

    const featureInfo = FEATURE_INFO[feature] || FEATURE_INFO.default;
    const displayPlan = getPlanDisplayName(requiredPlan);

    const handleUpgrade = () => {
        navigate('/pricing');
        if (onClose) onClose();
    };

    const handleClose = (e) => {
        if (e.target === e.currentTarget || e.currentTarget.tagName === 'BUTTON') {
            if (onClose) onClose();
        }
    };

    return (
        <Overlay onClick={handleClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <IconWrapper>{featureInfo.icon}</IconWrapper>

                <Title>{customTitle || featureInfo.title}</Title>

                <Description>
                    {customDescription || featureInfo.description}
                </Description>

                <PlanBadge plan={requiredPlan}>
                    Requires {displayPlan} Plan
                </PlanBadge>

                <FeatureList>
                    {featureInfo.benefits.map((benefit, index) => (
                        <FeatureItem key={index}>
                            <span className="icon">✓</span>
                            {benefit}
                        </FeatureItem>
                    ))}
                </FeatureList>

                <ButtonGroup>
                    <CloseButton onClick={handleClose}>
                        Maybe Later
                    </CloseButton>
                    <UpgradeButton onClick={handleUpgrade}>
                        View Plans
                    </UpgradeButton>
                </ButtonGroup>

                <CurrentPlan>
                    Your current plan: <strong>{getPlanDisplayName(currentPlan)}</strong>
                </CurrentPlan>
            </Modal>
        </Overlay>
    );
};

// Inline upgrade banner (for use within pages)
export const UpgradeBanner = styled.div`
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(123, 45, 255, 0.1));
    border: 1px solid rgba(0, 212, 255, 0.2);
    border-radius: 12px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

export const BannerContent = styled.div`
    flex: 1;
`;

export const BannerTitle = styled.h3`
    color: #fff;
    margin: 0 0 4px;
    font-size: 1.1rem;
`;

export const BannerText = styled.p`
    color: #8892b0;
    margin: 0;
    font-size: 0.9rem;
`;

export const BannerButton = styled.button`
    background: linear-gradient(135deg, #00d4ff, #7b2dff);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(0, 212, 255, 0.3);
    }
`;

// Inline component for quick upgrade prompts within pages
export const InlineUpgradePrompt = ({ feature, requiredPlan }) => {
    const navigate = useNavigate();
    const { getPlanDisplayName } = useSubscription();
    const featureInfo = FEATURE_INFO[feature] || FEATURE_INFO.default;

    return (
        <UpgradeBanner>
            <BannerContent>
                <BannerTitle>
                    {featureInfo.icon} {featureInfo.title}
                </BannerTitle>
                <BannerText>
                    Upgrade to {getPlanDisplayName(requiredPlan)} to unlock this feature
                </BannerText>
            </BannerContent>
            <BannerButton onClick={() => navigate('/pricing')}>
                Upgrade Now
            </BannerButton>
        </UpgradeBanner>
    );
};

export default UpgradePrompt;
