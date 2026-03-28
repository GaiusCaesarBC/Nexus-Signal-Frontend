// client/src/components/SubscriptionGuard.js - Enforce subscription access at route level
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import LoadingScreen from './LoadingScreen';

/**
 * SubscriptionGuard - Blocks access to premium features and redirects to pricing
 * 
 * Usage:
 *   <SubscriptionGuard requiredPlan="premium" featureIds={['hasAIChat']}>
 *     <ChatPage />
 *   </SubscriptionGuard>
 */
const SubscriptionGuard = ({ 
    children, 
    requiredPlan = 'starter',
    featureIds = [],
    fallbackPath = '/pricing'
}) => {
    const { 
        subscription, 
        hasPlanAccess, 
        canUseFeature,
        currentPlan,
        getPlanDisplayName,
        loading
    } = useSubscription();

    // Still loading subscription data
    if (loading) {
        return <LoadingScreen message="Checking your subscription..." />;
    }

    // Check plan access first
    const hasAccess = hasPlanAccess(requiredPlan);

    // If specific features required, check those too
    const hasAllFeatures = featureIds.length === 0 || 
        featureIds.every(featureId => canUseFeature(featureId));

    // If user doesn't have access, redirect to pricing
    if (!hasAccess || !hasAllFeatures) {
        console.log(`[SubscriptionGuard] Access denied. User: ${currentPlan}, Required: ${requiredPlan}`);
        
        // Store the attempted route for post-purchase redirect
        sessionStorage.setItem('redirectAfterPurchase', window.location.pathname);
        
        return <Navigate to={fallbackPath} replace />;
    }

    // User has access, render children
    return children;
};

export default SubscriptionGuard;
