// src/config/wagmi.js - RainbowKit & Wagmi Configuration
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    mainnet,
    bsc,
    polygon,
    arbitrum,
    optimism,
    avalanche,
    base
} from 'wagmi/chains';

// RainbowKit configuration with supported wallets
// Supports: MetaMask, WalletConnect, Coinbase, Trust Wallet
export const config = getDefaultConfig({
    appName: 'Nexus Signal',
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'nexus-signal-default',
    chains: [
        mainnet,
        bsc,
        polygon,
        arbitrum,
        optimism,
        avalanche,
        base
    ],
    ssr: false // Client-side only for React
});

// Supported chains for display
export const supportedChains = [
    { id: 1, name: 'Ethereum', symbol: 'ETH' },
    { id: 56, name: 'BNB Chain', symbol: 'BNB' },
    { id: 137, name: 'Polygon', symbol: 'MATIC' },
    { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
    { id: 10, name: 'Optimism', symbol: 'ETH' },
    { id: 43114, name: 'Avalanche', symbol: 'AVAX' },
    { id: 8453, name: 'Base', symbol: 'ETH' }
];

export default config;
