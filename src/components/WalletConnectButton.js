// src/components/WalletConnectButton.js - RainbowKit Wallet Connection Component
import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import {
    Wallet,
    Link2,
    Unlink,
    Check,
    AlertCircle,
    RefreshCw,
    ExternalLink
} from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const WalletCard = styled.div`
    background: ${props => props.$linked
        ? `linear-gradient(135deg, ${props.theme.success || '#10b981'}1A 0%, ${props.theme.success || '#10b981'}0D 100%)`
        : `${props.theme.brand?.primary || '#00adef'}0D`};
    border: 1px solid ${props => props.$linked
        ? `${props.theme.success || '#10b981'}4D`
        : `${props.theme.brand?.primary || '#00adef'}33`};
    border-radius: 12px;
    padding: 1rem;
    animation: ${fadeIn} 0.3s ease-out;
`;

const WalletHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
`;

const WalletTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const StatusBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    background: ${props => props.$status === 'linked'
        ? `${props.theme.success || '#10b981'}33`
        : props.$status === 'connected'
        ? `${props.theme.warning || '#fbbf24'}33`
        : `${props.theme.text?.tertiary || '#64748b'}33`};
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.$status === 'linked'
        ? props.theme.success || '#10b981'
        : props.$status === 'connected'
        ? props.theme.warning || '#fbbf24'
        : props.theme.text?.tertiary || '#64748b'};
`;

const WalletAddress = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: monospace;
    font-size: 0.9rem;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    padding: 0.5rem;
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.5)'};
    border-radius: 8px;
    margin-bottom: 0.75rem;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    background: ${props => {
        if (props.$variant === 'success') return `${props.theme.success || '#10b981'}`;
        if (props.$variant === 'danger') return `${props.theme.error || '#ef4444'}1A`;
        if (props.$variant === 'warning') return `${props.theme.warning || '#fbbf24'}1A`;
        return props.theme.brand?.gradient || `linear-gradient(135deg, ${props.theme.brand?.primary || '#00adef'} 0%, ${props.theme.brand?.secondary || '#0088cc'} 100%)`;
    }};
    border: 1px solid ${props => {
        if (props.$variant === 'danger') return `${props.theme.error || '#ef4444'}4D`;
        if (props.$variant === 'warning') return `${props.theme.warning || '#fbbf24'}4D`;
        return 'transparent';
    }};
    border-radius: 8px;
    color: ${props => {
        if (props.$variant === 'success') return 'white';
        if (props.$variant === 'danger') return props.theme.error || '#ef4444';
        if (props.$variant === 'warning') return props.theme.warning || '#fbbf24';
        return 'white';
    }};
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    min-width: 120px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${props => props.theme.brand?.primary || '#00adef'}33;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        ${props => props.$loading && css`animation: ${pulse} 1s ease-in-out infinite;`}
    }
`;

const InfoText = styled.p`
    font-size: 0.8rem;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    margin: 0;
    line-height: 1.4;
`;

const WarningBox = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem;
    background: ${props => props.theme.warning || '#fbbf24'}1A;
    border: 1px solid ${props => props.theme.warning || '#fbbf24'}4D;
    border-radius: 8px;
    margin-top: 0.5rem;
`;

const WarningText = styled.p`
    font-size: 0.8rem;
    color: ${props => props.theme.warning || '#fbbf24'};
    margin: 0;
    line-height: 1.4;
`;

// Truncate wallet address
const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const WalletConnectButton = ({ compact = false, showInfo = true }) => {
    const { user } = useAuth();
    const {
        isConnected,
        connectedAddress,
        linkedWallet,
        isWalletMatched,
        linkWallet,
        unlinkWallet,
        isLinking,
        isUnlinking,
        syncWalletToPortfolio,
        loading
    } = useWallet();

    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        await syncWalletToPortfolio();
        setIsSyncing(false);
    };

    // Not logged in
    if (!user) {
        return (
            <Container>
                <InfoText>Log in to connect your wallet</InfoText>
            </Container>
        );
    }

    // Loading state
    if (loading) {
        return (
            <Container>
                <WalletCard>
                    <WalletHeader>
                        <WalletTitle>
                            <Wallet size={18} />
                            Loading...
                        </WalletTitle>
                    </WalletHeader>
                </WalletCard>
            </Container>
        );
    }

    return (
        <Container>
            {/* RainbowKit Connect Button */}
            <ConnectButton.Custom>
                {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    mounted
                }) => {
                    const ready = mounted;
                    const connected = ready && account && chain;

                    return (
                        <div
                            {...(!ready && {
                                'aria-hidden': true,
                                style: {
                                    opacity: 0,
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                },
                            })}
                        >
                            {(() => {
                                // Not connected to any wallet
                                if (!connected) {
                                    return (
                                        <WalletCard $linked={!!linkedWallet}>
                                            <WalletHeader>
                                                <WalletTitle>
                                                    <Wallet size={18} />
                                                    Wallet Connection
                                                </WalletTitle>
                                                <StatusBadge $status={linkedWallet ? 'linked' : 'disconnected'}>
                                                    {linkedWallet ? (
                                                        <>
                                                            <Check size={12} />
                                                            Linked
                                                        </>
                                                    ) : 'Not Connected'}
                                                </StatusBadge>
                                            </WalletHeader>

                                            {linkedWallet && (
                                                <WalletAddress>
                                                    <Link2 size={14} />
                                                    {truncateAddress(linkedWallet.address)}
                                                </WalletAddress>
                                            )}

                                            <ButtonRow>
                                                <ActionButton onClick={openConnectModal}>
                                                    <Wallet size={16} />
                                                    Connect Wallet
                                                </ActionButton>
                                            </ButtonRow>

                                            {showInfo && !linkedWallet && (
                                                <InfoText style={{ marginTop: '0.75rem' }}>
                                                    Connect your wallet to link it to your Nexus Signal account
                                                </InfoText>
                                            )}
                                        </WalletCard>
                                    );
                                }

                                // Connected to wallet
                                return (
                                    <WalletCard $linked={!!linkedWallet}>
                                        <WalletHeader>
                                            <WalletTitle>
                                                <Wallet size={18} />
                                                {chain.name}
                                            </WalletTitle>
                                            <StatusBadge $status={linkedWallet ? 'linked' : 'connected'}>
                                                {linkedWallet ? (
                                                    <>
                                                        <Check size={12} />
                                                        Linked
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle size={12} />
                                                        Not Linked
                                                    </>
                                                )}
                                            </StatusBadge>
                                        </WalletHeader>

                                        <WalletAddress onClick={openAccountModal} style={{ cursor: 'pointer' }}>
                                            <Link2 size={14} />
                                            {truncateAddress(account.address)}
                                            <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                                        </WalletAddress>

                                        <ButtonRow>
                                            {/* If no linked wallet, show Link button */}
                                            {!linkedWallet && (
                                                <ActionButton
                                                    $variant="success"
                                                    onClick={linkWallet}
                                                    disabled={isLinking}
                                                    $loading={isLinking}
                                                >
                                                    {isLinking ? (
                                                        <>
                                                            <RefreshCw size={16} />
                                                            Linking...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Link2 size={16} />
                                                            Link Wallet
                                                        </>
                                                    )}
                                                </ActionButton>
                                            )}

                                            {/* If linked wallet exists */}
                                            {linkedWallet && (
                                                <>
                                                    {/* Sync button */}
                                                    <ActionButton
                                                        onClick={handleSync}
                                                        disabled={isSyncing || !isWalletMatched}
                                                        $loading={isSyncing}
                                                    >
                                                        <RefreshCw size={16} />
                                                        {isSyncing ? 'Syncing...' : 'Sync'}
                                                    </ActionButton>

                                                    {/* Unlink button */}
                                                    <ActionButton
                                                        $variant="danger"
                                                        onClick={unlinkWallet}
                                                        disabled={isUnlinking}
                                                        $loading={isUnlinking}
                                                    >
                                                        <Unlink size={16} />
                                                        {isUnlinking ? 'Unlinking...' : 'Unlink'}
                                                    </ActionButton>
                                                </>
                                            )}
                                        </ButtonRow>

                                        {/* Warning if connected wallet doesn't match linked wallet */}
                                        {linkedWallet && !isWalletMatched && (
                                            <WarningBox>
                                                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                                                <WarningText>
                                                    Connected wallet doesn't match your linked wallet.
                                                    Connect with {truncateAddress(linkedWallet.address)} to sync trades.
                                                </WarningText>
                                            </WarningBox>
                                        )}

                                        {showInfo && !linkedWallet && (
                                            <InfoText style={{ marginTop: '0.75rem' }}>
                                                Link this wallet to track your on-chain trades in your portfolio
                                            </InfoText>
                                        )}
                                    </WalletCard>
                                );
                            })()}
                        </div>
                    );
                }}
            </ConnectButton.Custom>
        </Container>
    );
};

export default WalletConnectButton;
