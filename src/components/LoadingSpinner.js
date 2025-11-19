// client/src/components/LoadingSpinner.js - Simple Loading Spinner for Suspense

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Activity } from 'lucide-react';

const rotate = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const SpinnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: ${props => props.fullScreen ? '100vh' : '400px'};
    background: ${props => props.fullScreen ? 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)' : 'transparent'};
    gap: 1rem;
`;

const Spinner = styled.div`
    animation: ${rotate} 1s linear infinite;
    color: #00adef;
    filter: drop-shadow(0 0 10px rgba(0, 173, 237, 0.6));
`;

const LoadingText = styled.div`
    color: #00adef;
    font-size: 1.2rem;
    font-weight: 600;
    animation: ${pulse} 1.5s ease-in-out infinite;
`;

const LoadingSpinner = ({ text = 'Loading...', fullScreen = false }) => {
    return (
        <SpinnerContainer fullScreen={fullScreen}>
            <Spinner>
                <Activity size={48} />
            </Spinner>
            <LoadingText>{text}</LoadingText>
        </SpinnerContainer>
    );
};

export default LoadingSpinner;