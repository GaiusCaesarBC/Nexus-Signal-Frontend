// src/pages/OAuthCallbackPage.js - Plaid OAuth Callback Handler
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { usePlaidLink } from 'react-plaid-link';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    CheckCircle,
    AlertCircle,
    Loader,
    Building2,
    ArrowRight
} from 'lucide-react';

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const Container = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: ${props => props.theme?.bg?.page || 'linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)'};
`;

const Card = styled.div`
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.8)'};
    border: 1px solid ${props => props.theme?.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 20px;
    padding: 3rem;
    max-width: 500px;
    width: 100%;
    text-align: center;
    animation: ${fadeIn} 0.5s ease-out;
    backdrop-filter: blur(10px);
`;

const IconWrapper = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    background: ${props => {
        if (props.$status === 'success') return `${props.theme?.success || '#10b981'}22`;
        if (props.$status === 'error') return `${props.theme?.error || '#ef4444'}22`;
        return `${props.theme?.brand?.primary || '#00adef'}22`;
    }};

    svg {
        color: ${props => {
            if (props.$status === 'success') return props.theme?.success || '#10b981';
            if (props.$status === 'error') return props.theme?.error || '#ef4444';
            return props.theme?.brand?.primary || '#00adef';
        }};
        ${props => props.$status === 'loading' && `animation: ${spin} 1s linear infinite;`}
    }
`;

const Title = styled.h1`
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    margin: 0 0 0.75rem 0;
`;

const Subtitle = styled.p`
    font-size: 1rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    margin: 0 0 2rem 0;
    line-height: 1.6;
`;

const StatusText = styled.p`
    font-size: 0.9rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
    margin: 1rem 0 0 0;
    animation: ${pulse} 1.5s ease-in-out infinite;
`;

const Button = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    background: ${props => props.$variant === 'primary'
        ? props.theme?.brand?.gradient || `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'} 0%, ${props.theme?.brand?.secondary || '#0088cc'} 100%)`
        : props.theme?.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border: 1px solid ${props => props.$variant === 'primary'
        ? 'transparent'
        : props.theme?.border || 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    color: ${props => props.$variant === 'primary'
        ? 'white'
        : props.theme?.text?.secondary || '#94a3b8'};
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1.5rem;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px ${props => props.theme?.brand?.primary || '#00adef'}33;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const ErrorDetails = styled.div`
    margin-top: 1rem;
    padding: 1rem;
    background: ${props => props.theme?.error || '#ef4444'}11;
    border: 1px solid ${props => props.theme?.error || '#ef4444'}33;
    border-radius: 8px;
    text-align: left;
    font-size: 0.85rem;
    color: ${props => props.theme?.error || '#ef4444'};
`;

const OAuthCallbackPage = () => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [status, setStatus] = useState('loading'); // loading, connecting, success, error
    const [error, setError] = useState(null);
    const [linkToken, setLinkToken] = useState(null);

    // Get the OAuth state ID from URL params
    const oauthStateId = searchParams.get('oauth_state_id');

    // Create a new link token for OAuth completion
    const createLinkToken = useCallback(async () => {
        if (!user) {
            setStatus('error');
            setError('Please log in to complete the connection');
            return;
        }

        try {
            const response = await api.post('/brokerage/plaid/link-token');
            if (response.data.success) {
                setLinkToken(response.data.linkToken);
            } else {
                throw new Error('Failed to create link token');
            }
        } catch (err) {
            console.error('Error creating link token:', err);
            setStatus('error');
            setError(err.response?.data?.error || 'Failed to initialize connection');
        }
    }, [user]);

    // Initialize on mount
    useEffect(() => {
        if (!oauthStateId) {
            setStatus('error');
            setError('Missing OAuth state. Please try connecting again from the Portfolio page.');
            return;
        }

        createLinkToken();
    }, [oauthStateId, createLinkToken]);

    // Plaid Link configuration for OAuth completion
    const { open, ready } = usePlaidLink({
        token: linkToken,
        receivedRedirectUri: window.location.href,
        onSuccess: async (publicToken, metadata) => {
            try {
                setStatus('connecting');

                const response = await api.post('/brokerage/plaid/exchange', {
                    publicToken,
                    institutionId: metadata.institution?.institution_id,
                    institutionName: metadata.institution?.name
                });

                if (response.data.success) {
                    setStatus('success');
                    // Redirect to portfolio after 2 seconds
                    setTimeout(() => {
                        navigate('/portfolio');
                    }, 2000);
                } else {
                    throw new Error(response.data.error || 'Connection failed');
                }
            } catch (err) {
                console.error('Error exchanging token:', err);
                setStatus('error');
                setError(err.response?.data?.error || 'Failed to complete connection');
            }
        },
        onExit: (err) => {
            if (err) {
                console.error('Plaid Link error:', err);
                setStatus('error');
                setError(err.display_message || err.error_message || 'Connection was cancelled');
            } else {
                // User closed without error - go back to portfolio
                navigate('/portfolio');
            }
        }
    });

    // Open Plaid Link when ready
    useEffect(() => {
        if (linkToken && ready && oauthStateId && status === 'loading') {
            open();
        }
    }, [linkToken, ready, oauthStateId, status, open]);

    const getIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircle size={40} />;
            case 'error':
                return <AlertCircle size={40} />;
            case 'connecting':
                return <Loader size={40} />;
            default:
                return <Building2 size={40} />;
        }
    };

    const getTitle = () => {
        switch (status) {
            case 'success':
                return 'Connection Successful!';
            case 'error':
                return 'Connection Failed';
            case 'connecting':
                return 'Completing Connection...';
            default:
                return 'Completing Authorization';
        }
    };

    const getSubtitle = () => {
        switch (status) {
            case 'success':
                return 'Your brokerage account has been connected. Redirecting to your portfolio...';
            case 'error':
                return 'We encountered an issue connecting your account.';
            case 'connecting':
                return 'Please wait while we securely connect your account...';
            default:
                return 'Please wait while we complete the OAuth authorization process...';
        }
    };

    return (
        <Container theme={theme}>
            <Card theme={theme}>
                <IconWrapper theme={theme} $status={status === 'connecting' ? 'loading' : status}>
                    {getIcon()}
                </IconWrapper>

                <Title theme={theme}>{getTitle()}</Title>
                <Subtitle theme={theme}>{getSubtitle()}</Subtitle>

                {status === 'loading' && (
                    <StatusText theme={theme}>
                        Initializing secure connection...
                    </StatusText>
                )}

                {status === 'error' && (
                    <>
                        {error && (
                            <ErrorDetails theme={theme}>
                                {error}
                            </ErrorDetails>
                        )}
                        <Button
                            theme={theme}
                            $variant="primary"
                            onClick={() => navigate('/portfolio')}
                        >
                            Back to Portfolio
                            <ArrowRight size={18} />
                        </Button>
                    </>
                )}

                {status === 'success' && (
                    <Button
                        theme={theme}
                        $variant="primary"
                        onClick={() => navigate('/portfolio')}
                    >
                        Go to Portfolio
                        <ArrowRight size={18} />
                    </Button>
                )}
            </Card>
        </Container>
    );
};

export default OAuthCallbackPage;
