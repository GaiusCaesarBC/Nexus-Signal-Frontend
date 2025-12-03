import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Use environment variable for Stripe public key (falls back to test key for development)
const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_51SKpIxCtdTItnGjynKIM6de7vIjS5gRSAEItwWZC7XgQpEekd8VKv2E7c7D6nEutF3xmDps6fDYHeoV5Xec5izsG00bXHMcaMl';
const stripePromise = loadStripe(stripePublicKey);

const StripeContext = createContext();

export const useStripe = () => {
    const context = useContext(StripeContext);
    if (!context) {
        throw new Error('useStripe must be used within a StripeProvider');
    }
    return context;
};

export const StripeProvider = ({ children }) => {
    return (
        <StripeContext.Provider value={{ stripePromise }}>
            {children}
        </StripeContext.Provider>
    );
};