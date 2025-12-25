// client/src/pages/PatternScannerPage.js - AI Pattern Scanner

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import UpgradePrompt from '../components/UpgradePrompt';
import { useNavigate } from 'react-router-dom';
import {
    Search, TrendingUp, TrendingDown, BarChart3,
    Star, RefreshCw, Zap, Activity, Target,
    Sparkles, ChevronDown, ChevronUp, Plus, X,
    Layers, Eye, AlertTriangle, CheckCircle, Clock,
    Triangle, ArrowUp, ArrowDown, Coffee, Hexagon, Circle
} from 'lucide-react';

// ============ DEFAULT SYMBOLS TO SCAN ============
const DEFAULT_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'AMD', 'NFLX', 'SPY'];
const DEFAULT_CRYPTO = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'DOTUSDT'];

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    padding-left: 2rem;
    padding-right: 2rem;
    padding-bottom: 2rem;
    position: relative;
    overflow-x: hidden;
`;

const Header = styled.div`
    max-width: 1800px;
    margin: 0 auto 3rem;
    ${css`animation: ${fadeIn} 0.8s ease-out;`}
    text-align: center;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #00ff88 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2.5rem;
        flex-direction: column;
    }
`;

const TitleIcon = styled.div`
    ${css`animation: ${float} 3s ease-in-out infinite;`}
`;

const Subtitle = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.success || '#00ff88'}33 100%);
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}66;
    border-radius: 20px;
    font-size: 0.9rem;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

// ============ MODE TOGGLE ============
const ModeToggle = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
`;

const ModeButton = styled.button`
    padding: 1rem 2rem;
    background: ${props => props.$active ?
        `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'}4D 0%, ${props.theme?.brand?.primary || '#00adef'}26 100%)` :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${props => props.$active ? `${props.theme?.brand?.primary || '#00adef'}80` : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? (props.theme?.brand?.primary || '#00adef') : (props.theme?.text?.secondary || '#94a3b8')};
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.75rem;

    &:hover {
        background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}4D 0%, ${props => props.theme?.brand?.primary || '#00adef'}26 100%);
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}80;
        color: ${props => props.theme?.brand?.primary || '#00adef'};
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }
`;

// ============ CONTROLS ============
const ControlsBar = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    padding: 1.5rem 2rem;
    ${css`animation: ${fadeIn} 0.6s ease-out;`}

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 1rem;
    }
`;

const SymbolInput = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    max-width: 400px;

    @media (max-width: 768px) {
        width: 100%;
        max-width: none;
    }
`;

const Input = styled.input`
    flex: 1;
    padding: 0.75rem 1rem;
    background: ${props => props.theme?.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
    font-size: 1rem;
    outline: none;
    transition: all 0.2s;

    &:focus {
        border-color: ${props => props.theme?.brand?.primary || '#00adef'};
        box-shadow: 0 0 0 3px ${props => props.theme?.brand?.primary || '#00adef'}33;
    }

    &::placeholder {
        color: ${props => props.theme?.text?.tertiary || '#64748b'};
    }
`;

const AddButton = styled.button`
    padding: 0.75rem 1rem;
    background: ${props => props.theme?.brand?.primary || '#00adef'};
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ControlButtons = styled.div`
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
        width: 100%;
        justify-content: space-between;
    }
`;

const ActionButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$primary ?
        `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'} 0%, ${props.theme?.brand?.secondary || '#0088cc'} 100%)` :
        `${props.theme?.brand?.primary || '#00adef'}1A`
    };
    border: 1px solid ${props => props.theme?.brand?.primary || '#00adef'}4D;
    border-radius: 10px;
    color: ${props => props.$primary ? 'white' : (props.theme?.brand?.primary || '#00adef')};
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        background: ${props => props.$primary ?
            `linear-gradient(135deg, ${props.theme?.brand?.primary || '#00adef'} 0%, ${props.theme?.brand?.secondary || '#0088cc'} 100%)` :
            `${props.theme?.brand?.primary || '#00adef'}33`
        };
        transform: translateY(-2px);
        box-shadow: 0 8px 20px ${props => props.theme?.brand?.primary || '#00adef'}4D;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        ${props => props.$loading && css`animation: ${spin} 1s linear infinite;`}
    }
`;

// ============ SYMBOL CHIPS ============
const SymbolChipsContainer = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem;
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
`;

const SymbolChip = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.$hasPatterns ?
        `${props.theme?.success || '#10b981'}22` :
        `${props.theme?.brand?.primary || '#00adef'}1A`
    };
    border: 1px solid ${props => props.$hasPatterns ?
        `${props.theme?.success || '#10b981'}4D` :
        `${props.theme?.brand?.primary || '#00adef'}4D`
    };
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${props => props.$hasPatterns ?
        (props.theme?.success || '#10b981') :
        (props.theme?.brand?.primary || '#00adef')
    };
    transition: all 0.2s;

    &:hover {
        transform: scale(1.05);
    }
`;

const RemoveChip = styled.button`
    background: transparent;
    border: none;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;

    &:hover {
        opacity: 1;
    }
`;

const ChipBadge = styled.span`
    background: ${props => props.theme?.success || '#10b981'};
    color: white;
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 10px;
    font-weight: 700;
`;

// ============ RESULTS ============
const ResultsContainer = styled.div`
    max-width: 1800px;
    margin: 0 auto;
`;

const ResultsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
    ${css`animation: ${fadeIn} 0.6s ease-out;`}

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const PatternCard = styled.div`
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    backdrop-filter: blur(10px);
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-5px);
        border-color: ${props => props.theme?.brand?.primary || '#00adef'}66;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }
`;

const CardHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    background: ${props => props.theme?.brand?.primary || '#00adef'}1A;
    border-bottom: 1px solid ${props => props.theme?.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
`;

const SymbolInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const SymbolIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef, #00ff88)'};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 1.2rem;
`;

const SymbolName = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

const PatternCount = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: ${props => props.$count > 0 ?
        `${props.theme?.success || '#10b981'}22` :
        `${props.theme?.text?.tertiary || '#64748b'}22`
    };
    border-radius: 20px;
    color: ${props => props.$count > 0 ?
        (props.theme?.success || '#10b981') :
        (props.theme?.text?.tertiary || '#64748b')
    };
    font-weight: 700;
`;

const CardBody = styled.div`
    padding: 1.25rem 1.5rem;
`;

const PatternList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const PatternItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: ${props => props.$type === 'bullish' ?
        `${props.theme?.success || '#10b981'}15` :
        `${props.theme?.error || '#ef4444'}15`
    };
    border: 1px solid ${props => props.$type === 'bullish' ?
        `${props.theme?.success || '#10b981'}33` :
        `${props.theme?.error || '#ef4444'}33`
    };
    border-radius: 12px;
`;

const PatternInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const PatternIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${props => props.$type === 'bullish' ?
        `${props.theme?.success || '#10b981'}22` :
        `${props.theme?.error || '#ef4444'}22`
    };
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$type === 'bullish' ?
        (props.theme?.success || '#10b981') :
        (props.theme?.error || '#ef4444')
    };
`;

const PatternDetails = styled.div`
    display: flex;
    flex-direction: column;
`;

const PatternName = styled.span`
    font-weight: 700;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
`;

const PatternType = styled.span`
    font-size: 0.8rem;
    color: ${props => props.$type === 'bullish' ?
        (props.theme?.success || '#10b981') :
        (props.theme?.error || '#ef4444')
    };
    text-transform: capitalize;
`;

const ConfidenceBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    background: ${props => {
        if (props.$confidence >= 0.8) return `${props.theme?.success || '#10b981'}22`;
        if (props.$confidence >= 0.6) return `${props.theme?.warning || '#f59e0b'}22`;
        return `${props.theme?.text?.tertiary || '#64748b'}22`;
    }};
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    color: ${props => {
        if (props.$confidence >= 0.8) return props.theme?.success || '#10b981';
        if (props.$confidence >= 0.6) return props.theme?.warning || '#f59e0b';
        return props.theme?.text?.tertiary || '#64748b';
    }};
`;

const NoPatterns = styled.div`
    text-align: center;
    padding: 2rem;
    color: ${props => props.theme?.text?.tertiary || '#64748b'};
`;

// ============ EMPTY STATE ============
const EmptyState = styled.div`
    text-align: center;
    padding: 4rem 2rem;
    ${css`animation: ${fadeIn} 0.5s ease-out;`}
`;

const EmptyIcon = styled.div`
    width: 150px;
    height: 150px;
    margin: 0 auto 2rem;
    background: linear-gradient(135deg, ${props => props.theme?.brand?.primary || '#00adef'}33 0%, ${props => props.theme?.brand?.primary || '#00adef'}0D 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed ${props => props.theme?.brand?.primary || '#00adef'}66;
    ${css`animation: ${float} 3s ease-in-out infinite;`}
`;

const EmptyTitle = styled.h2`
    color: ${props => props.theme?.brand?.primary || '#00adef'};
    font-size: 2rem;
    margin-bottom: 1rem;
`;

const EmptyText = styled.p`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.2rem;
`;

// ============ LOADING STATE ============
const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    gap: 1rem;
`;

const LoadingSpinner = styled(Sparkles)`
    ${css`animation: ${spin} 1s linear infinite;`}
    color: ${props => props.theme?.brand?.primary || '#00adef'};
`;

const LoadingText = styled.div`
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
`;

const ProgressBar = styled.div`
    width: 300px;
    height: 8px;
    background: ${props => props.theme?.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 4px;
    overflow: hidden;
`;

const ProgressFill = styled.div`
    height: 100%;
    background: ${props => props.theme?.brand?.gradient || 'linear-gradient(135deg, #00adef, #00ff88)'};
    border-radius: 4px;
    transition: width 0.3s ease;
    width: ${props => props.$progress}%;
`;

// ============ STATS BAR ============
const StatsBar = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
`;

const StatCard = styled.div`
    background: ${props => props.theme?.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme?.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const StatIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.$color || props.theme?.brand?.primary}22;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color || props.theme?.brand?.primary};
`;

const StatInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const StatValue = styled.div`
    font-size: 1.5rem;
    font-weight: 900;
    color: ${props => props.theme?.text?.primary || '#e0e6ed'};
`;

const StatLabel = styled.div`
    font-size: 0.85rem;
    color: ${props => props.theme?.text?.secondary || '#94a3b8'};
`;

// ============ COMPONENT ============
const PatternScannerPage = () => {
    const { api, isAuthenticated } = useAuth();
    const toast = useToast();
    const { theme } = useTheme();
    const { hasPlanAccess } = useSubscription();
    const navigate = useNavigate();

    // Subscription gate
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(!hasPlanAccess('pro'));

    const [mode, setMode] = useState('stocks');
    const [symbols, setSymbols] = useState(DEFAULT_STOCKS);
    const [newSymbol, setNewSymbol] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [results, setResults] = useState([]);
    const [lastScanned, setLastScanned] = useState(null);

    // Switch default symbols when mode changes
    useEffect(() => {
        if (mode === 'stocks') {
            setSymbols(DEFAULT_STOCKS);
        } else {
            setSymbols(DEFAULT_CRYPTO);
        }
        setResults([]);
    }, [mode]);

    // Add a symbol
    const handleAddSymbol = () => {
        const sym = newSymbol.trim().toUpperCase();
        if (!sym) return;
        if (symbols.includes(sym)) {
            toast.error(`${sym} is already in the list`, 'Duplicate');
            return;
        }
        setSymbols([...symbols, sym]);
        setNewSymbol('');
        toast.success(`${sym} added to scan list`, 'Added');
    };

    // Remove a symbol
    const handleRemoveSymbol = (sym) => {
        setSymbols(symbols.filter(s => s !== sym));
    };

    // Scan for patterns
    const scanPatterns = useCallback(async () => {
        if (symbols.length === 0) {
            toast.error('Add some symbols to scan', 'No Symbols');
            return;
        }

        setLoading(true);
        setScanProgress(0);
        setResults([]);

        const scanResults = [];
        const total = symbols.length;

        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            try {
                const response = await api.get(`/patterns/${encodeURIComponent(symbol)}`);

                if (response.data?.success) {
                    scanResults.push({
                        symbol,
                        patternsFound: response.data.patternsFound || 0,
                        patterns: response.data.patterns || [],
                        candlesAnalyzed: response.data.candlesAnalyzed || 0
                    });
                } else {
                    scanResults.push({
                        symbol,
                        patternsFound: 0,
                        patterns: [],
                        error: response.data?.error
                    });
                }
            } catch (error) {
                console.error(`Error scanning ${symbol}:`, error);
                scanResults.push({
                    symbol,
                    patternsFound: 0,
                    patterns: [],
                    error: error.message
                });
            }

            setScanProgress(Math.round(((i + 1) / total) * 100));

            // Small delay to avoid rate limiting
            if (i < symbols.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        // Sort by patterns found (most first)
        scanResults.sort((a, b) => b.patternsFound - a.patternsFound);

        setResults(scanResults);
        setLastScanned(new Date());
        setLoading(false);

        const patternsFound = scanResults.filter(r => r.patternsFound > 0).length;
        const totalPatterns = scanResults.reduce((sum, r) => sum + r.patternsFound, 0);

        if (totalPatterns > 0) {
            toast.success(`Found ${totalPatterns} patterns in ${patternsFound} symbols!`, 'Scan Complete');
        } else {
            toast.info('No patterns detected in the scanned symbols', 'Scan Complete');
        }
    }, [api, symbols, toast]);

    // Navigate to chart page
    const handleCardClick = (symbol) => {
        if (mode === 'crypto') {
            navigate(`/crypto/${symbol.replace('USDT', '')}`);
        } else {
            navigate(`/stocks/${symbol}`);
        }
    };

    // Calculate stats
    const stats = {
        totalScanned: results.length,
        withPatterns: results.filter(r => r.patternsFound > 0).length,
        bullishPatterns: results.reduce((sum, r) => sum + r.patterns.filter(p => p.type === 'bullish').length, 0),
        bearishPatterns: results.reduce((sum, r) => sum + r.patterns.filter(p => p.type === 'bearish').length, 0)
    };

    // Get pattern icon
    const getPatternIcon = (patternName) => {
        const name = patternName?.toLowerCase() || '';
        if (name.includes('triangle')) return <Triangle size={18} />;
        if (name.includes('head') || name.includes('shoulders')) return <Hexagon size={18} />;
        if (name.includes('double')) return <Layers size={18} />;
        if (name.includes('flag') || name.includes('pennant')) return <Activity size={18} />;
        if (name.includes('cup')) return <Coffee size={18} />;
        if (name.includes('wedge')) return <ArrowUp size={18} />;
        return <Circle size={18} />;
    };

    return (
        <PageContainer theme={theme}>
            {/* Subscription Gate */}
            <UpgradePrompt
                isOpen={showUpgradePrompt}
                onClose={() => setShowUpgradePrompt(false)}
                feature="pattern-scanner"
                requiredPlan="pro"
            />

            <Header>
                <Title theme={theme}>
                    <TitleIcon>
                        <Layers size={56} color={theme?.brand?.primary || '#00adef'} />
                    </TitleIcon>
                    AI Pattern Scanner
                </Title>
                <Subtitle theme={theme}>
                    Scan multiple symbols for chart patterns using advanced AI detection
                </Subtitle>
                <PoweredBy theme={theme}>
                    <Zap size={18} />
                    Real-time pattern recognition
                </PoweredBy>
            </Header>

            {/* Mode Toggle */}
            <ModeToggle>
                <ModeButton
                    theme={theme}
                    $active={mode === 'stocks'}
                    onClick={() => setMode('stocks')}
                >
                    <BarChart3 size={24} />
                    Stocks
                </ModeButton>
                <ModeButton
                    theme={theme}
                    $active={mode === 'crypto'}
                    onClick={() => setMode('crypto')}
                >
                    <Activity size={24} />
                    Crypto
                </ModeButton>
            </ModeToggle>

            {/* Controls */}
            <ControlsBar theme={theme}>
                <SymbolInput>
                    <Input
                        theme={theme}
                        type="text"
                        placeholder="Add symbol (e.g., AAPL, BTCUSDT)"
                        value={newSymbol}
                        onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
                    />
                    <AddButton theme={theme} onClick={handleAddSymbol} disabled={!newSymbol.trim()}>
                        <Plus size={18} />
                        Add
                    </AddButton>
                </SymbolInput>
                <ControlButtons>
                    <ActionButton
                        theme={theme}
                        $primary
                        onClick={scanPatterns}
                        disabled={loading || symbols.length === 0}
                        $loading={loading}
                    >
                        <RefreshCw size={18} />
                        {loading ? `Scanning (${scanProgress}%)` : 'Scan All'}
                    </ActionButton>
                </ControlButtons>
            </ControlsBar>

            {/* Symbol Chips */}
            <SymbolChipsContainer theme={theme}>
                {symbols.map(sym => {
                    const result = results.find(r => r.symbol === sym);
                    const hasPatterns = result?.patternsFound > 0;
                    return (
                        <SymbolChip key={sym} theme={theme} $hasPatterns={hasPatterns}>
                            {sym}
                            {hasPatterns && <ChipBadge theme={theme}>{result.patternsFound}</ChipBadge>}
                            <RemoveChip onClick={() => handleRemoveSymbol(sym)}>
                                <X size={14} />
                            </RemoveChip>
                        </SymbolChip>
                    );
                })}
            </SymbolChipsContainer>

            {/* Stats Bar (only show after scan) */}
            {results.length > 0 && (
                <StatsBar>
                    <StatCard theme={theme}>
                        <StatIcon theme={theme} $color={theme?.brand?.primary}>
                            <Eye size={24} />
                        </StatIcon>
                        <StatInfo>
                            <StatValue theme={theme}>{stats.totalScanned}</StatValue>
                            <StatLabel theme={theme}>Symbols Scanned</StatLabel>
                        </StatInfo>
                    </StatCard>
                    <StatCard theme={theme}>
                        <StatIcon theme={theme} $color={theme?.success}>
                            <CheckCircle size={24} />
                        </StatIcon>
                        <StatInfo>
                            <StatValue theme={theme}>{stats.withPatterns}</StatValue>
                            <StatLabel theme={theme}>With Patterns</StatLabel>
                        </StatInfo>
                    </StatCard>
                    <StatCard theme={theme}>
                        <StatIcon theme={theme} $color="#10b981">
                            <TrendingUp size={24} />
                        </StatIcon>
                        <StatInfo>
                            <StatValue theme={theme}>{stats.bullishPatterns}</StatValue>
                            <StatLabel theme={theme}>Bullish Patterns</StatLabel>
                        </StatInfo>
                    </StatCard>
                    <StatCard theme={theme}>
                        <StatIcon theme={theme} $color="#ef4444">
                            <TrendingDown size={24} />
                        </StatIcon>
                        <StatInfo>
                            <StatValue theme={theme}>{stats.bearishPatterns}</StatValue>
                            <StatLabel theme={theme}>Bearish Patterns</StatLabel>
                        </StatInfo>
                    </StatCard>
                </StatsBar>
            )}

            {/* Results */}
            {loading ? (
                <LoadingContainer>
                    <LoadingSpinner theme={theme} size={64} />
                    <LoadingText theme={theme}>
                        Scanning {symbols.length} symbols for patterns...
                    </LoadingText>
                    <ProgressBar theme={theme}>
                        <ProgressFill theme={theme} $progress={scanProgress} />
                    </ProgressBar>
                </LoadingContainer>
            ) : results.length > 0 ? (
                <ResultsContainer>
                    <ResultsGrid>
                        {results.map((result) => (
                            <PatternCard
                                key={result.symbol}
                                theme={theme}
                                onClick={() => handleCardClick(result.symbol)}
                            >
                                <CardHeader theme={theme}>
                                    <SymbolInfo>
                                        <SymbolIcon theme={theme}>
                                            {result.symbol.substring(0, 2)}
                                        </SymbolIcon>
                                        <SymbolName theme={theme}>{result.symbol}</SymbolName>
                                    </SymbolInfo>
                                    <PatternCount theme={theme} $count={result.patternsFound}>
                                        <Layers size={16} />
                                        {result.patternsFound} pattern{result.patternsFound !== 1 ? 's' : ''}
                                    </PatternCount>
                                </CardHeader>
                                <CardBody>
                                    {result.patternsFound > 0 ? (
                                        <PatternList>
                                            {result.patterns.slice(0, 3).map((pattern, idx) => (
                                                <PatternItem key={idx} theme={theme} $type={pattern.type}>
                                                    <PatternInfo>
                                                        <PatternIcon theme={theme} $type={pattern.type}>
                                                            {getPatternIcon(pattern.name)}
                                                        </PatternIcon>
                                                        <PatternDetails>
                                                            <PatternName theme={theme}>{pattern.name}</PatternName>
                                                            <PatternType theme={theme} $type={pattern.type}>
                                                                {pattern.type}
                                                            </PatternType>
                                                        </PatternDetails>
                                                    </PatternInfo>
                                                    <ConfidenceBadge theme={theme} $confidence={pattern.confidence / 100}>
                                                        <Target size={14} />
                                                        {Math.round(pattern.confidence)}%
                                                    </ConfidenceBadge>
                                                </PatternItem>
                                            ))}
                                            {result.patterns.length > 3 && (
                                                <NoPatterns theme={theme}>
                                                    +{result.patterns.length - 3} more patterns
                                                </NoPatterns>
                                            )}
                                        </PatternList>
                                    ) : (
                                        <NoPatterns theme={theme}>
                                            <AlertTriangle size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                            <div>No patterns detected</div>
                                        </NoPatterns>
                                    )}
                                </CardBody>
                            </PatternCard>
                        ))}
                    </ResultsGrid>
                </ResultsContainer>
            ) : (
                <EmptyState theme={theme}>
                    <EmptyIcon theme={theme}>
                        <Search size={80} color={theme?.brand?.primary || '#00adef'} />
                    </EmptyIcon>
                    <EmptyTitle theme={theme}>Ready to Scan</EmptyTitle>
                    <EmptyText theme={theme}>
                        Click "Scan All" to detect chart patterns across your selected symbols
                    </EmptyText>
                </EmptyState>
            )}
        </PageContainer>
    );
};

export default PatternScannerPage;
