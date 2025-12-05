// src/context/WalletContext.js - Wallet Connection & Linking Context
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WalletContext = createContext();

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const { api, user, refreshUser } = useAuth();
    const toast = useToast();
    const { address, isConnected, chain } = useAccount();
    const { disconnect } = useDisconnect();

    // Local state
    const [linkedWallet, setLinkedWallet] = useState(null);
    const [isLinking, setIsLinking] = useState(false);
    const [isUnlinking, setIsUnlinking] = useState(false);
    const [walletTrades, setWalletTrades] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get balance for connected wallet
    const { data: balanceData } = useBalance({
        address: address,
        enabled: !!address
    });

    // Fetch linked wallet on mount and when user changes
    useEffect(() => {
        if (user) {
            fetchLinkedWallet();
        } else {
            setLinkedWallet(null);
            setLoading(false);
        }
    }, [user]);

    // Fetch the user's linked wallet from backend
    const fetchLinkedWallet = useCallback(async () => {
        if (!api) return;

        try {
            setLoading(true);
            const response = await api.get('/wallet/linked');
            if (response.data.success && response.data.wallet) {
                setLinkedWallet(response.data.wallet);
            } else {
                setLinkedWallet(null);
            }
        } catch (error) {
            console.error('Error fetching linked wallet:', error);
            setLinkedWallet(null);
        } finally {
            setLoading(false);
        }
    }, [api]);

    // Link wallet to user account
    const linkWallet = useCallback(async () => {
        if (!address || !api) {
            toast.error('Please connect your wallet first');
            return false;
        }

        if (linkedWallet) {
            toast.warning('You already have a linked wallet. Unlink it first.');
            return false;
        }

        try {
            setIsLinking(true);
            const response = await api.post('/wallet/link', {
                address: address,
                chainId: chain?.id || 1
            });

            if (response.data.success) {
                setLinkedWallet(response.data.wallet);
                toast.success('Wallet linked successfully!');
                if (refreshUser) refreshUser();
                return true;
            } else {
                toast.error(response.data.error || 'Failed to link wallet');
                return false;
            }
        } catch (error) {
            console.error('Error linking wallet:', error);
            const errorMsg = error.response?.data?.error || 'Failed to link wallet';
            toast.error(errorMsg);
            return false;
        } finally {
            setIsLinking(false);
        }
    }, [address, chain, api, linkedWallet, toast, refreshUser]);

    // Unlink wallet from user account
    const unlinkWallet = useCallback(async () => {
        if (!linkedWallet || !api) {
            toast.error('No wallet to unlink');
            return false;
        }

        try {
            setIsUnlinking(true);
            const response = await api.post('/wallet/unlink');

            if (response.data.success) {
                setLinkedWallet(null);
                toast.success('Wallet unlinked successfully');
                if (refreshUser) refreshUser();
                return true;
            } else {
                toast.error(response.data.error || 'Failed to unlink wallet');
                return false;
            }
        } catch (error) {
            console.error('Error unlinking wallet:', error);
            toast.error('Failed to unlink wallet');
            return false;
        } finally {
            setIsUnlinking(false);
        }
    }, [linkedWallet, api, toast, refreshUser]);

    // Fetch wallet transactions/trades
    const fetchWalletTrades = useCallback(async () => {
        if (!linkedWallet || !api) return [];

        try {
            const response = await api.get('/wallet/trades');
            if (response.data.success) {
                setWalletTrades(response.data.trades || []);
                return response.data.trades || [];
            }
        } catch (error) {
            console.error('Error fetching wallet trades:', error);
        }
        return [];
    }, [linkedWallet, api]);

    // Sync wallet transactions to portfolio
    const syncWalletToPortfolio = useCallback(async () => {
        if (!linkedWallet || !api) {
            toast.error('No wallet linked');
            return false;
        }

        try {
            const response = await api.post('/wallet/sync');
            if (response.data.success) {
                toast.success(`Synced ${response.data.tradesImported || 0} trades!`);
                await fetchWalletTrades();
                return true;
            } else {
                toast.error(response.data.error || 'Sync failed');
                return false;
            }
        } catch (error) {
            console.error('Error syncing wallet:', error);
            toast.error('Failed to sync wallet');
            return false;
        }
    }, [linkedWallet, api, toast, fetchWalletTrades]);

    // Check if connected wallet matches linked wallet
    const isWalletMatched = address && linkedWallet &&
        address.toLowerCase() === linkedWallet.address.toLowerCase();

    // Check if user can trade (has linked wallet OR brokerage - for now just wallet)
    const canTrade = !!linkedWallet;

    const value = {
        // Connection state
        isConnected,
        connectedAddress: address,
        connectedChain: chain,
        balance: balanceData,

        // Linked wallet state
        linkedWallet,
        isWalletMatched,
        loading,

        // Actions
        linkWallet,
        unlinkWallet,
        disconnect,
        isLinking,
        isUnlinking,

        // Trades
        walletTrades,
        fetchWalletTrades,
        syncWalletToPortfolio,

        // Permissions
        canTrade,

        // Refresh
        refreshLinkedWallet: fetchLinkedWallet
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};

export default WalletContext;
