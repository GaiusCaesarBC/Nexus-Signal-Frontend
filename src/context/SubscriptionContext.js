// client/src/context/SubscriptionContext.js - Subscription & Feature Gating Context

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

// Plan hierarchy for comparison
const PLAN_HIERARCHY = ['free', 'starter', 'pro', 'premium', 'elite'];

// Default plan limits (matches server-side PLAN_LIMITS)
const DEFAULT_PLAN_LIMITS = {
    free: {
        dailySignals: 0,
        watchlists: 0,
        watchlistAssets: 0,
        predictionsPerMonth: 0,
        hasAdvancedAnalysis: false,
        hasPriceAlerts: false,
        hasAIChat: false,
        hasNexusAI: false,
        hasPortfolioTracking: false,
        hasCustomAlerts: false,
        hasAPIAccess: false,
        hasBacktesting: false,
        hasMultiAccount: false,
        hasMentorship: false,
        hasVIPCommunity: false
    },
    starter: {
        dailySignals: 5,
        watchlists: 1,
        watchlistAssets: 10,
        predictionsPerMonth: 3,
        hasAdvancedAnalysis: false,
        hasPriceAlerts: false,
        hasAIChat: false,
        hasNexusAI: false,
        hasPortfolioTracking: false,
        hasCustomAlerts: false,
        hasAPIAccess: false,
        hasBacktesting: false,
        hasMultiAccount: false,
        hasMentorship: false,
        hasVIPCommunity: false
    },
    pro: {
        dailySignals: 15,
        watchlists: 3,
        watchlistAssets: 30,
        predictionsPerMonth: 10,
        hasAdvancedAnalysis: true,
        hasPriceAlerts: true,
        hasAIChat: true,
        hasAIChatGPT4: false,
        hasNexusAI: false,
        hasPortfolioTracking: false,
        hasCustomAlerts: false,
        hasAPIAccess: false,
        hasBacktesting: false,
        hasMultiAccount: false,
        hasMentorship: false,
        hasVIPCommunity: false
    },
    premium: {
        dailySignals: -1,
        watchlists: -1,
        watchlistAssets: -1,
        predictionsPerMonth: -1,
        hasAdvancedAnalysis: true,
        hasPriceAlerts: true,
        hasAIChat: true,
        hasAIChatGPT4: true,
        hasNexusAI: true,
        hasPortfolioTracking: true,
        hasCustomAlerts: true,
        hasLiveData: true,
        hasPatternRecognition: true,
        hasSectorAnalysis: true,
        hasAPIAccess: false,
        hasBacktesting: false,
        hasMultiAccount: false,
        hasMentorship: false,
        hasVIPCommunity: false
    },
    elite: {
        dailySignals: -1,
        watchlists: -1,
        watchlistAssets: -1,
        predictionsPerMonth: -1,
        hasAdvancedAnalysis: true,
        hasPriceAlerts: true,
        hasAIChat: true,
        hasAIChatGPT4: true,
        hasNexusAI: true,
        hasPortfolioTracking: true,
        hasCustomAlerts: true,
        hasLiveData: true,
        hasPatternRecognition: true,
        hasSectorAnalysis: true,
        hasAPIAccess: true,
        hasUltraLowLatency: true,
        hasBacktesting: true,
        hasInstitutionalAnalytics: true,
        hasMultiAccount: true,
        hasCustomResearch: true,
        hasMentorship: true,
        hasWhiteLabel: true,
        hasDedicatedManager: true,
        hasVIPCommunity: true
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
