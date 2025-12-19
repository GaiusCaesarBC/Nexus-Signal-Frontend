import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Stripe public key from environment variable (required)
const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
    console.error('REACT_APP_STRIPE_PUBLIC_KEY is not set. Stripe payments will not work.');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

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