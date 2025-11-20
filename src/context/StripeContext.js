import React, { createContext, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51SKpIxCtdTItnGjynKIM6de7vIjS5gRSAEItwWZC7XgQpEekd8VKv2E7c7D6nEutF3xmDps6fDYHeoV5Xec5izsG00bXHMcaMl');

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