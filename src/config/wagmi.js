// src/config/wagmi.js - RainbowKit & Wagmi Configuration
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';
import {
    mainnet,
    bsc,
    polygon,
    arbitrum,
    optimism,
    avalanche,
    base
} from 'wagmi/chains';

// Check if WalletConnect project ID is properly configured
// Get a valid project ID from https://cloud.walletconnect.com/
// Then add localhost and your production domain to "Allowed Origins"
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;

// Known invalid/placeholder project IDs that cause 403 errors
const INVALID_PROJECT_IDS = [
    'nexus-signal-default',
];

const isValidProjectId = projectId &&
    !INVALID_PROJECT_IDS.includes(projectId) &&
    !projectId.includes('REPLACE_ME') &&
    projectId.length >= 20;

// Export flag for components to check
export const walletConnectEnabled = isValidProjectId;

// RainbowKit configuration with supported wallets
// Supports: MetaMask, WalletConnect, Coinbase, Trust Wallet
let config;

if (isValidProjectId) {
    // Full config with WalletConnect
    config = getDefaultConfig({
        appName: 'Nexus Signal',
        projectId: projectId,
        chains: [mainnet, bsc, polygon, arbitrum, optimism, avalanche, base],
        ssr: false
    });
} else {
    // Fallback config without WalletConnect (injected wallets like MetaMask only)
    // This prevents 403/network errors from WalletConnect Cloud
    console.warn(
        '[Wagmi] WalletConnect disabled - invalid project ID.',
        'Get one at https://cloud.walletconnect.com/',
        'Then add localhost + production domain to Allowed Origins'
    );
    config = createConfig({
        chains: [mainnet, bsc, polygon, arbitrum, optimism, avalanche, base],
        transports: {
            [mainnet.id]: http(),
            [bsc.id]: http(),
            [polygon.id]: http(),
            [arbitrum.id]: http(),
            [optimism.id]: http(),
            [avalanche.id]: http(),
            [base.id]: http(),
        },
    });
}

export { config };

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
