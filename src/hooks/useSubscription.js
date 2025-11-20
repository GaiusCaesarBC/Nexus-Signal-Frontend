// client/src/hooks/useSubscription.js - Easy subscription checking

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useSubscription = () => {
    const { api, isAuthenticated } = useAuth();
    const [subscription, setSubscription] = useState({
        plan: 'free',
        limits: {},
        usage: {},
        loading: true,
        error: null
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchSubscription();
        }
    }, [isAuthenticated]);

    const fetchSubscription = async () => {
        try {
            const response = await api.get('/stripe/plan-limits');
            setSubscription({
                ...response.data.data,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
            setSubscription(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    };

    // Check if user has a specific feature
    const hasFeature = (featureName) => {
        return subscription.limits?.[featureName] === true || 
               subscription.limits?.[featureName] === -1;
    };

    // Check if user can perform an action (based on limit)
    const canPerformAction = (limitType) => {
        const limit = subscription.limits?.[limitType];
        const usage = subscription.usage?.[limitType] || 0;
        
        // -1 means unlimited
        if (limit === -1) return { can: true, remaining: -1 };
        
        // Check if under limit
        const can = usage < limit;
        const remaining = limit - usage;
        
        return { can, remaining, limit, usage };
    };

    // Check if user meets minimum plan requirement
    const hasPlanOrHigher = (minPlan) => {
        const planHierarchy = ['free', 'starter', 'pro', 'premium', 'elite'];
        const userPlanLevel = planHierarchy.indexOf(subscription.plan);
        const requiredPlanLevel = planHierarchy.indexOf(minPlan);
        
        return userPlanLevel >= requiredPlanLevel;
    };

    // Get upgrade suggestions
    const getUpgradeSuggestion = (featureName) => {
        const planFeatures = {
            starter: ['dailySignals', 'watchlists', 'predictionsPerMonth'],
            pro: ['hasAdvancedAnalysis', 'hasPriceAlerts', 'hasAIChat'],
            premium: ['hasAIChatGPT4', 'hasPortfolioTracking', 'hasLiveData', 'hasPatternRecognition'],
            elite: ['hasAPIAccess', 'hasBacktesting', 'hasMultiAccount', 'hasMentorship']
        };

        for (const [plan, features] of Object.entries(planFeatures)) {
            if (features.includes(featureName)) {
                return plan;
            }
        }
        return 'premium';
    };

    // Refresh subscription data
    const refresh = () => {
        fetchSubscription();
    };

    return {
        ...subscription,
        hasFeature,
        canPerformAction,
        hasPlanOrHigher,
        getUpgradeSuggestion,
        refresh
    };
};

// Example usage in components:
/*
import { useSubscription } from '../hooks/useSubscription';
import UpgradePrompt from '../components/UpgradePrompt';

const MyComponent = () => {
    const { plan, limits, hasFeature, canPerformAction } = useSubscription();
    const [showUpgrade, setShowUpgrade] = useState(false);

    // Check feature access
    if (!hasFeature('hasAIChat')) {
        return (
            <div>
                <p>AI Chat is not available on your plan</p>
                <button onClick={() => setShowUpgrade(true)}>Upgrade</button>
            </div>
        );
    }

    // Check usage limit
    const { can, remaining } = canPerformAction('predictionsPerMonth');
    if (!can) {
        return (
            <div>
                <p>You've reached your monthly prediction limit</p>
                <button onClick={() => setShowUpgrade(true)}>Upgrade for Unlimited</button>
            </div>
        );
    }

    return (
        <>
            <div>
                <p>Predictions remaining this month: {remaining === -1 ? 'Unlimited' : remaining}</p>
                {/* Your component content *\/}
            </div>
            
            <UpgradePrompt 
                isOpen={showUpgrade}
                onClose={() => setShowUpgrade(false)}
                currentPlan={plan}
                requiredPlan="premium"
                feature="Unlimited Predictions"
            />
        </>
    );
};
*/