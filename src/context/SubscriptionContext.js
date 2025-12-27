// client/src/context/SubscriptionContext.js - Subscription & Feature Gating Context

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

// Plan hierarchy for comparison
const PLAN_HIERARCHY = ['free', 'starter', 'pro', 'premium', 'elite'];

// Default plan limits (matches server-side PLAN_LIMITS)
// IMPORTANT: Keep in sync with PricingPage.js features!
const DEFAULT_PLAN_LIMITS = {
    free: {
        // Limits
        dailySignals: 0,
        watchlists: 0,
        watchlistAssets: 0,
        predictionsPerMonth: 0,
        // Free features (Gamification, Paper Trading, Social)
        hasGamification: true,
        hasPaperTrading: true,
        hasSocialFeed: true,
        // Paid features - all false
        hasScreener: false,
        hasNewsFeed: false,
        hasSentimentAnalysis: false,
        hasTradeJournal: false,
        hasStockDetails: false,
        hasHeatmap: false,
        hasTechnicalIndicators: false,
        hasStockComparison: false,
        hasAdvancedAnalysis: false,
        hasPriceAlerts: false,
        hasAIChat: false,
        hasAIChatGPT4: false,
        hasNexusAI: false,
        hasPredictionHistory: false,
        hasAccuracyAnalytics: false,
        hasPortfolioTracking: false,
        hasCustomAlerts: false,
        hasLiveData: false,
        hasPatternRecognition: false,
        hasSectorAnalysis: false,
        hasWhaleAlerts: false,
        hasDarkPoolFlow: false,
        hasInstitutionalActivity: false,
        hasCongressionalTrades: false,
        hasDiscoveryPage: false,
        hasAPIAccess: false,
        hasUltraLowLatency: false,
        hasBacktesting: false,
        hasInstitutionalAnalytics: false,
        hasMultiAccount: false,
        hasCustomResearch: false,
        hasMentorship: false,
        hasWhiteLabel: false,
        hasDedicatedManager: false,
        hasVIPCommunity: false,
        hasWhaleWebhooks: false,
        hasEarlyAccess: false,
        hasSwingTrading: false
    },
    starter: {
        // Limits
        dailySignals: 5,
        watchlists: 1,
        watchlistAssets: 10,
        predictionsPerMonth: 3,
        // Free features
        hasGamification: true,
        hasPaperTrading: true,
        hasSocialFeed: true,
        // Starter features
        hasScreener: true,
        hasNewsFeed: true,
        hasSentimentAnalysis: true,
        hasTradeJournal: true,
        hasStockDetails: true,
        // Not included in Starter
        hasHeatmap: false,
        hasTechnicalIndicators: false,
        hasStockComparison: false,
        hasAdvancedAnalysis: false,
        hasPriceAlerts: false,
        hasAIChat: false,
        hasAIChatGPT4: false,
        hasNexusAI: false,
        hasPredictionHistory: false,
        hasAccuracyAnalytics: false,
        hasPortfolioTracking: false,
        hasCustomAlerts: false,
        hasLiveData: false,
        hasPatternRecognition: false,
        hasSectorAnalysis: false,
        hasWhaleAlerts: false,
        hasDarkPoolFlow: false,
        hasInstitutionalActivity: false,
        hasCongressionalTrades: false,
        hasDiscoveryPage: false,
        hasAPIAccess: false,
        hasUltraLowLatency: false,
        hasBacktesting: false,
        hasInstitutionalAnalytics: false,
        hasMultiAccount: false,
        hasCustomResearch: false,
        hasMentorship: false,
        hasWhiteLabel: false,
        hasDedicatedManager: false,
        hasVIPCommunity: false,
        hasWhaleWebhooks: false,
        hasEarlyAccess: false,
        hasSwingTrading: false
    },
    pro: {
        // Limits
        dailySignals: 15,
        watchlists: 3,
        watchlistAssets: 30,
        predictionsPerMonth: 10,
        // Free features
        hasGamification: true,
        hasPaperTrading: true,
        hasSocialFeed: true,
        // Starter features
        hasScreener: true,
        hasNewsFeed: true,
        hasSentimentAnalysis: true,
        hasTradeJournal: true,
        hasStockDetails: true,
        // Pro features
        hasHeatmap: true,
        hasTechnicalIndicators: true,
        hasStockComparison: true,
        hasAdvancedAnalysis: true,
        hasPriceAlerts: true,
        hasAIChat: true,
        // Not included in Pro
        hasAIChatGPT4: false,
        hasNexusAI: false,
        hasPredictionHistory: false,
        hasAccuracyAnalytics: false,
        hasPortfolioTracking: false,
        hasCustomAlerts: false,
        hasLiveData: false,
        hasPatternRecognition: false,
        hasSectorAnalysis: false,
        hasWhaleAlerts: false,
        hasDarkPoolFlow: false,
        hasInstitutionalActivity: false,
        hasCongressionalTrades: false,
        hasDiscoveryPage: false,
        hasAPIAccess: false,
        hasUltraLowLatency: false,
        hasBacktesting: false,
        hasInstitutionalAnalytics: false,
        hasMultiAccount: false,
        hasCustomResearch: false,
        hasMentorship: false,
        hasWhiteLabel: false,
        hasDedicatedManager: false,
        hasVIPCommunity: false,
        hasWhaleWebhooks: false,
        hasEarlyAccess: false,
        hasSwingTrading: true
    },
    premium: {
        // Limits - Unlimited
        dailySignals: -1,
        watchlists: -1,
        watchlistAssets: -1,
        predictionsPerMonth: -1,
        // Free features
        hasGamification: true,
        hasPaperTrading: true,
        hasSocialFeed: true,
        // Starter features
        hasScreener: true,
        hasNewsFeed: true,
        hasSentimentAnalysis: true,
        hasTradeJournal: true,
        hasStockDetails: true,
        // Pro features
        hasHeatmap: true,
        hasTechnicalIndicators: true,
        hasStockComparison: true,
        hasAdvancedAnalysis: true,
        hasPriceAlerts: true,
        hasAIChat: true,
        // Premium features
        hasAIChatGPT4: true,
        hasNexusAI: true,
        hasPredictionHistory: true,
        hasAccuracyAnalytics: true,
        hasPortfolioTracking: true,
        hasCustomAlerts: true,
        hasLiveData: true,
        hasPatternRecognition: true,
        hasSectorAnalysis: true,
        hasWhaleAlerts: true,
        hasDarkPoolFlow: true,
        hasInstitutionalActivity: true,
        hasCongressionalTrades: true,
        hasDiscoveryPage: true,
        // Not included in Premium
        hasAPIAccess: false,
        hasUltraLowLatency: false,
        hasBacktesting: false,
        hasInstitutionalAnalytics: false,
        hasMultiAccount: false,
        hasCustomResearch: false,
        hasMentorship: false,
        hasWhiteLabel: false,
        hasDedicatedManager: false,
        hasVIPCommunity: false,
        hasWhaleWebhooks: false,
        hasEarlyAccess: false,
        hasSwingTrading: true
    },
    elite: {
        // Limits - Unlimited
        dailySignals: -1,
        watchlists: -1,
        watchlistAssets: -1,
        predictionsPerMonth: -1,
        // Free features
        hasGamification: true,
        hasPaperTrading: true,
        hasSocialFeed: true,
        // Starter features
        hasScreener: true,
        hasNewsFeed: true,
        hasSentimentAnalysis: true,
        hasTradeJournal: true,
        hasStockDetails: true,
        // Pro features
        hasHeatmap: true,
        hasTechnicalIndicators: true,
        hasStockComparison: true,
        hasAdvancedAnalysis: true,
        hasPriceAlerts: true,
        hasAIChat: true,
        // Premium features
        hasAIChatGPT4: true,
        hasNexusAI: true,
        hasPredictionHistory: true,
        hasAccuracyAnalytics: true,
        hasPortfolioTracking: true,
        hasCustomAlerts: true,
        hasLiveData: true,
        hasPatternRecognition: true,
        hasSectorAnalysis: true,
        hasWhaleAlerts: true,
        hasDarkPoolFlow: true,
        hasInstitutionalActivity: true,
        hasCongressionalTrades: true,
        hasDiscoveryPage: true,
        // Elite features
        hasAPIAccess: true,
        hasUltraLowLatency: true,
        hasBacktesting: true,
        hasInstitutionalAnalytics: true,
        hasMultiAccount: true,
        hasCustomResearch: true,
        hasMentorship: true,
        hasWhiteLabel: true,
        hasDedicatedManager: true,
        hasVIPCommunity: true,
        hasWhaleWebhooks: true,
        hasEarlyAccess: true,
        hasSwingTrading: true
    }
};

export const SubscriptionProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    // Get current subscription info
    const subscription = useMemo(() => {
        if (!isAuthenticated || !user) {
            return {
                status: 'free',
                planLimits: DEFAULT_PLAN_LIMITS.free,
                isActive: false
            };
        }

        const status = user.subscription?.status || 'free';
        const planLimits = user.subscription?.planLimits || DEFAULT_PLAN_LIMITS[status] || DEFAULT_PLAN_LIMITS.free;

        return {
            status,
            planLimits,
            isActive: status !== 'free',
            stripeCustomerId: user.subscription?.stripeCustomerId,
            currentPeriodEnd: user.subscription?.currentPeriodEnd,
            cancelAtPeriodEnd: user.subscription?.cancelAtPeriodEnd
        };
    }, [user, isAuthenticated]);

    // Check if user has a specific feature (boolean features)
    const canUseFeature = useCallback((featureName) => {
        return subscription.planLimits[featureName] === true;
    }, [subscription.planLimits]);

    // Check if user has access to a minimum plan level
    const hasPlanAccess = useCallback((requiredPlan) => {
        const userPlanIndex = PLAN_HIERARCHY.indexOf(subscription.status);
        const requiredPlanIndex = PLAN_HIERARCHY.indexOf(requiredPlan);
        return userPlanIndex >= requiredPlanIndex;
    }, [subscription.status]);

    // Get limit for a countable feature
    const getLimit = useCallback((limitType) => {
        const limit = subscription.planLimits[limitType];
        return limit === -1 ? Infinity : (limit || 0);
    }, [subscription.planLimits]);

    // Check if a limit allows for more usage
    const canUseMore = useCallback((limitType, currentUsage) => {
        const limit = getLimit(limitType);
        return limit === Infinity || currentUsage < limit;
    }, [getLimit]);

    // Get remaining usage for a limit
    const getRemainingUsage = useCallback((limitType, currentUsage) => {
        const limit = getLimit(limitType);
        if (limit === Infinity) return Infinity;
        return Math.max(0, limit - currentUsage);
    }, [getLimit]);

    // Get the minimum plan required for a feature
    const getRequiredPlan = useCallback((featureName) => {
        for (const plan of PLAN_HIERARCHY) {
            if (DEFAULT_PLAN_LIMITS[plan]?.[featureName]) {
                return plan;
            }
        }
        return 'elite'; // Default to highest tier if not found
    }, []);

    // Human-readable plan name
    const getPlanDisplayName = useCallback((plan) => {
        const names = {
            free: 'Free',
            starter: 'Starter',
            pro: 'Pro',
            premium: 'Premium',
            elite: 'Elite'
        };
        return names[plan] || plan;
    }, []);

    const value = {
        subscription,
        currentPlan: subscription.status,
        planLimits: subscription.planLimits,
        isSubscribed: subscription.isActive,

        // Feature checks
        canUseFeature,
        hasPlanAccess,
        getLimit,
        canUseMore,
        getRemainingUsage,
        getRequiredPlan,
        getPlanDisplayName,

        // Shorthand feature checks for common features
        hasAIChat: canUseFeature('hasAIChat'),
        hasPriceAlerts: canUseFeature('hasPriceAlerts'),
        hasAdvancedAnalysis: canUseFeature('hasAdvancedAnalysis'),
        hasBacktesting: canUseFeature('hasBacktesting'),
        hasAPIAccess: canUseFeature('hasAPIAccess'),
        hasSwingTrading: canUseFeature('hasSwingTrading'),

        // Constants
        PLAN_HIERARCHY,
        DEFAULT_PLAN_LIMITS
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

export default SubscriptionContext;
