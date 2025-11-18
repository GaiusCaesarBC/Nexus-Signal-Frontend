// client/src/components/ErrorBoundary.js - Professional Error Handling

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const ErrorContainer = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    padding: 2rem;
`;

const ErrorCard = styled.div`
    max-width: 600px;
    width: 100%;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 3rem;
    text-align: center;
    animation: ${fadeIn} 0.5s ease-out;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
`;

const IconWrapper = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 2rem;
    background: rgba(239, 68, 68, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(239, 68, 68, 0.4);
`;

const ErrorTitle = styled.h1`
    font-size: 2.5rem;
    color: #ef4444;
    margin-bottom: 1rem;
    font-weight: 900;
`;

const ErrorMessage = styled.p`
    font-size: 1.1rem;
    color: #94a3b8;
    margin-bottom: 2rem;
    line-height: 1.6;
`;

const ErrorDetails = styled.details`
    text-align: left;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 2rem;
    cursor: pointer;

    summary {
        color: #ef4444;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    pre {
        color: #cbd5e1;
        font-size: 0.85rem;
        overflow-x: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
`;

const Button = styled.button`
    padding: 1rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: none;

    &:hover {
        transform: translateY(-2px);
    }
`;

const PrimaryButton = styled(Button)`
    background: linear-gradient(135deg, #00adef, #0088cc);
    color: white;
    box-shadow: 0 8px 20px rgba(0, 173, 237, 0.4);

    &:hover {
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.6);
    }
`;

const SecondaryButton = styled(Button)`
    background: rgba(100, 116, 139, 0.2);
    border: 1px solid rgba(100, 116, 139, 0.4);
    color: #cbd5e1;

    &:hover {
        background: rgba(100, 116, 139, 0.3);
        border-color: rgba(100, 116, 139, 0.6);
    }
`;

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console
        console.error('Error Boundary caught an error:', error, errorInfo);
        
        // You can also log to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
        
        this.setState({
            error,
            errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorContainer>
                    <ErrorCard>
                        <IconWrapper>
                            <AlertTriangle size={50} color="#ef4444" />
                        </IconWrapper>
                        
                        <ErrorTitle>Oops! Something went wrong</ErrorTitle>
                        
                        <ErrorMessage>
                            We encountered an unexpected error. Don't worry, your data is safe. 
                            Try refreshing the page or go back home.
                        </ErrorMessage>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <ErrorDetails>
                                <summary>Error Details (Development Only)</summary>
                                <pre>
                                    <strong>Error:</strong> {this.state.error.toString()}
                                    {this.state.errorInfo && (
                                        <>
                                            <br /><br />
                                            <strong>Component Stack:</strong>
                                            {this.state.errorInfo.componentStack}
                                        </>
                                    )}
                                </pre>
                            </ErrorDetails>
                        )}

                        <ButtonGroup>
                            <PrimaryButton onClick={this.handleReload}>
                                <RefreshCw size={20} />
                                Reload Page
                            </PrimaryButton>
                            <SecondaryButton onClick={this.handleGoHome}>
                                <Home size={20} />
                                Go Home
                            </SecondaryButton>
                        </ButtonGroup>
                    </ErrorCard>
                </ErrorContainer>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;