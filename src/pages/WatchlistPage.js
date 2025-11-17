// client/src/pages/WatchlistPage.js - FIXED

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import Watchlist from '../components/Watchlist';
import { Plus } from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const PageContainer = styled.div`
    padding: 3rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
    color: #e2e8f0;
    background: linear-gradient(145deg, #0d1a2f 0%, #1a273b 100%);
    min-height: calc(100vh - var(--navbar-height));
    animation: ${fadeIn} 0.8s ease-out;
`;

const Header = styled.h1`
    font-size: 3rem;
    color: #00adef;
    margin-bottom: 2rem;
    text-align: center;
    text-shadow: 0 0 15px rgba(0, 173, 237, 0.6);
    
    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const AddSymbolSection = styled.div`
    background: linear-gradient(135deg, #1e293b 0%, #2c3e50 100%);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 173, 237, 0.2);
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
`;

const AddSymbolForm = styled.form`
    display: flex;
    gap: 1rem;
    align-items: stretch;
    
    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

const Input = styled.input`
    flex-grow: 1;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    border: 1px solid rgba(0, 173, 237, 0.3);
    background-color: #0d1a2f;
    color: #e2e8f0;
    font-size: 1rem;
    transition: all 0.2s ease;

    &::placeholder {
        color: #64748b;
    }

    &:focus {
        outline: none;
        border-color: #00adef;
        box-shadow: 0 0 0 3px rgba(0, 173, 237, 0.2);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const Button = styled.button`
    padding: 1rem 2rem;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #00adef 0%, #0088cc 100%);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 173, 237, 0.4);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;

const Message = styled.div`
    background-color: ${props => props.type === 'success' 
        ? 'rgba(16, 185, 129, 0.1)' 
        : 'rgba(239, 68, 68, 0.1)'};
    border: 1px solid ${props => props.type === 'success' 
        ? 'rgba(16, 185, 129, 0.3)' 
        : 'rgba(239, 68, 68, 0.3)'};
    color: ${props => props.type === 'success' ? '#10b981' : '#ef4444'};
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    text-align: center;
    font-weight: 500;
    animation: ${fadeIn} 0.3s ease-out;
`;

const WatchlistPage = () => {
    const { api, isAuthenticated } = useAuth();
    const [newSymbol, setNewSymbol] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!newSymbol.trim()) {
            setMessage('Please enter a symbol.');
            setMessageType('error');
            return;
        }

        if (!isAuthenticated || !api) {
            setMessage('Please log in to add to watchlist.');
            setMessageType('error');
            return;
        }

        setIsAdding(true);

        try {
            const symbol = newSymbol.trim().toUpperCase();
            await api.post('/watchlist/add', { symbol });
            
            setMessage(`${symbol} added to watchlist!`);
            setMessageType('success');
            setNewSymbol('');
            
            // Refresh the page after a short delay to show the new item
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            setMessage(error.response?.data?.msg || 'Failed to add symbol. Please try again.');
            setMessageType('error');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <PageContainer>
            <Header>My Watchlist</Header>

            <AddSymbolSection>
                {message && <Message type={messageType}>{message}</Message>}

                <AddSymbolForm onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="Enter symbol (e.g., AAPL, BTC, ETH)"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                        disabled={isAdding}
                        aria-label="Add new symbol to watchlist"
                        maxLength={10}
                    />
                    <Button type="submit" disabled={!newSymbol.trim() || isAdding || !isAuthenticated}>
                        <Plus size={20} />
                        {isAdding ? 'Adding...' : 'Add to Watchlist'}
                    </Button>
                </AddSymbolForm>
            </AddSymbolSection>

            <Watchlist />
        </PageContainer>
    );
};

export default WatchlistPage;