// client/src/components/dev/PriceServiceTester.jsx
// Development tool to test the centralized price service
// Add to your routes temporarily: <Route path="/dev/price-test" element={<PriceServiceTester />} />

import React, { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PriceServiceTester = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customSymbol, setCustomSymbol] = useState('');
    const [healthData, setHealthData] = useState(null);
    const [batchResults, setBatchResults] = useState(null);

    // Get auth token from localStorage (adjust based on your auth setup)
    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Test a single symbol
    const testPrice = useCallback(async (symbol, expectedType = null) => {
        const startTime = Date.now();
        const testId = Date.now() + Math.random();
        
        // Add pending result
        setResults(prev => [...prev, {
            id: testId,
            symbol,
            status: 'loading',
            timestamp: new Date().toLocaleTimeString()
        }]);

        try {
            const response = await axios.get(
                `${API_BASE}/api/predictions/price/${symbol}`,
                { headers: getAuthHeader() }
            );
            
            const duration = Date.now() - startTime;
            
            setResults(prev => prev.map(r => 
                r.id === testId ? {
                    ...r,
                    status: 'success',
                    price: response.data.price,
                    source: response.data.source,
                    cached: response.data.cached,
                    isCrypto: response.data.isCrypto,
                    duration,
                    expectedType,
                    typeMatch: expectedType === null || 
                        (expectedType === 'crypto' && response.data.isCrypto) ||
                        (expectedType === 'stock' && !response.data.isCrypto)
                } : r
            ));
        } catch (error) {
            const duration = Date.now() - startTime;
            setResults(prev => prev.map(r => 
                r.id === testId ? {
                    ...r,
                    status: 'error',
                    error: error.response?.data?.error || error.message,
                    duration
                } : r
            ));
        }
    }, []);

    // Run full test suite
    const runFullTest = async () => {
        setLoading(true);
        setResults([]);
        setBatchResults(null);

        const testCases = [
            // Stocks
            { symbol: 'AAPL', type: 'stock', name: 'Apple' },
            { symbol: 'TSLA', type: 'stock', name: 'Tesla' },
            { symbol: 'MSFT', type: 'stock', name: 'Microsoft' },
            { symbol: 'GOOGL', type: 'stock', name: 'Google' },
            
            // Major Crypto
            { symbol: 'BTC', type: 'crypto', name: 'Bitcoin' },
            { symbol: 'ETH', type: 'crypto', name: 'Ethereum' },
            { symbol: 'SOL', type: 'crypto', name: 'Solana' },
            { symbol: 'DOGE', type: 'crypto', name: 'Dogecoin' },
            
            // Meme coins (tests expanded symbol map)
            { symbol: 'PEPE', type: 'crypto', name: 'Pepe' },
            { symbol: 'SHIB', type: 'crypto', name: 'Shiba Inu' },
            
            // With suffix
            { symbol: 'BTC-USD', type: 'crypto', name: 'BTC with suffix' },
        ];

        for (const test of testCases) {
            await testPrice(test.symbol, test.type);
            // Small delay between requests
            await new Promise(r => setTimeout(r, 500));
        }

        setLoading(false);
    };

    // Test cache performance
    const testCache = async () => {
        setLoading(true);
        const symbol = 'BTC';
        
        // Clear existing results for this test
        setResults([]);

        // First fetch (should hit API)
        await testPrice(symbol, 'crypto');
        await new Promise(r => setTimeout(r, 100));
        
        // Second fetch (should hit cache)
        await testPrice(symbol, 'crypto');
        await new Promise(r => setTimeout(r, 100));
        
        // Third fetch (should hit cache)
        await testPrice(symbol, 'crypto');

        setLoading(false);
    };

    // Check health endpoint
    const checkHealth = async () => {
        try {
            const response = await axios.get(
                `${API_BASE}/api/predictions/health`,
                { headers: getAuthHeader() }
            );
            setHealthData(response.data);
        } catch (error) {
            setHealthData({ error: error.message });
        }
    };

    // Test custom symbol
    const testCustomSymbol = async () => {
        if (!customSymbol.trim()) return;
        await testPrice(customSymbol.trim().toUpperCase());
    };

    // Clear results
    const clearResults = () => {
        setResults([]);
        setHealthData(null);
        setBatchResults(null);
    };

    // Calculate stats
    const stats = {
        total: results.length,
        success: results.filter(r => r.status === 'success').length,
        errors: results.filter(r => r.status === 'error').length,
        cached: results.filter(r => r.cached).length,
        avgDuration: results.length > 0 
            ? Math.round(results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length)
            : 0
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>🧪 Price Service Tester</h1>
                <p style={styles.subtitle}>Development tool for testing the centralized price service</p>
            </div>

            {/* Control Panel */}
            <div style={styles.controlPanel}>
                <div style={styles.buttonGroup}>
                    <button 
                        onClick={runFullTest} 
                        disabled={loading}
                        style={{...styles.button, ...styles.primaryButton}}
                    >
                        {loading ? '⏳ Running...' : '🚀 Run Full Test'}
                    </button>
                    <button 
                        onClick={testCache} 
                        disabled={loading}
                        style={{...styles.button, ...styles.secondaryButton}}
                    >
                        🔄 Test Cache
                    </button>
                    <button 
                        onClick={checkHealth} 
                        disabled={loading}
                        style={{...styles.button, ...styles.secondaryButton}}
                    >
                        ❤️ Health Check
                    </button>
                    <button 
                        onClick={clearResults}
                        style={{...styles.button, ...styles.dangerButton}}
                    >
                        🗑️ Clear
                    </button>
                </div>

                {/* Custom Symbol Input */}
                <div style={styles.customInput}>
                    <input
                        type="text"
                        value={customSymbol}
                        onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                        placeholder="Enter symbol (e.g., AAPL, BTC)"
                        style={styles.input}
                        onKeyPress={(e) => e.key === 'Enter' && testCustomSymbol()}
                    />
                    <button 
                        onClick={testCustomSymbol}
                        disabled={loading || !customSymbol.trim()}
                        style={{...styles.button, ...styles.primaryButton}}
                    >
                        Test Symbol
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            {results.length > 0 && (
                <div style={styles.statsBar}>
                    <div style={styles.stat}>
                        <span style={styles.statLabel}>Total</span>
                        <span style={styles.statValue}>{stats.total}</span>
                    </div>
                    <div style={styles.stat}>
                        <span style={styles.statLabel}>Success</span>
                        <span style={{...styles.statValue, color: '#10b981'}}>{stats.success}</span>
                    </div>
                    <div style={styles.stat}>
                        <span style={styles.statLabel}>Errors</span>
                        <span style={{...styles.statValue, color: '#ef4444'}}>{stats.errors}</span>
                    </div>
                    <div style={styles.stat}>
                        <span style={styles.statLabel}>Cached</span>
                        <span style={{...styles.statValue, color: '#8b5cf6'}}>{stats.cached}</span>
                    </div>
                    <div style={styles.stat}>
                        <span style={styles.statLabel}>Avg Time</span>
                        <span style={styles.statValue}>{stats.avgDuration}ms</span>
                    </div>
                </div>
            )}

            {/* Health Data */}
            {healthData && (
                <div style={styles.healthCard}>
                    <h3 style={styles.cardTitle}>❤️ Health Status</h3>
                    <pre style={styles.pre}>{JSON.stringify(healthData, null, 2)}</pre>
                </div>
            )}

            {/* Results Table */}
            {results.length > 0 && (
                <div style={styles.resultsContainer}>
                    <h3 style={styles.cardTitle}>📊 Test Results</h3>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Time</th>
                                <th style={styles.th}>Symbol</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Price</th>
                                <th style={styles.th}>Source</th>
                                <th style={styles.th}>Type</th>
                                <th style={styles.th}>Cached</th>
                                <th style={styles.th}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result) => (
                                <tr key={result.id} style={styles.tr}>
                                    <td style={styles.td}>{result.timestamp}</td>
                                    <td style={{...styles.td, fontWeight: 'bold'}}>{result.symbol}</td>
                                    <td style={styles.td}>
                                        {result.status === 'loading' && <span style={styles.loading}>⏳</span>}
                                        {result.status === 'success' && <span style={styles.success}>✅</span>}
                                        {result.status === 'error' && (
                                            <span style={styles.error} title={result.error}>❌</span>
                                        )}
                                    </td>
                                    <td style={{...styles.td, fontFamily: 'monospace'}}>
                                        {result.price !== undefined 
                                            ? `$${result.price.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: result.price < 1 ? 6 : 2
                                            })}`
                                            : '-'
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        {result.source && (
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: 
                                                    result.source === 'coingecko' ? '#f7931a20' :
                                                    result.source === 'alphavantage' ? '#5b21b620' :
                                                    '#6b728020'
                                            }}>
                                                {result.source}
                                            </span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        {result.isCrypto !== undefined && (
                                            <span style={{
                                                ...styles.badge,
                                                backgroundColor: result.isCrypto ? '#f7931a20' : '#10b98120'
                                            }}>
                                                {result.isCrypto ? '🪙 Crypto' : '📈 Stock'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        {result.cached !== undefined && (
                                            result.cached 
                                                ? <span style={{color: '#8b5cf6'}}>✓ Yes</span>
                                                : <span style={{color: '#6b7280'}}>No</span>
                                        )}
                                    </td>
                                    <td style={{...styles.td, fontFamily: 'monospace'}}>
                                        {result.duration !== undefined && (
                                            <span style={{
                                                color: result.duration < 100 ? '#10b981' : 
                                                       result.duration < 500 ? '#f59e0b' : '#ef4444'
                                            }}>
                                                {result.duration}ms
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Instructions */}
            <div style={styles.instructions}>
                <h3 style={styles.cardTitle}>📝 How to Use</h3>
                <ul style={styles.list}>
                    <li><strong>Run Full Test:</strong> Tests stocks, major crypto, and meme coins</li>
                    <li><strong>Test Cache:</strong> Fetches BTC 3 times - watch duration drop on cached calls</li>
                    <li><strong>Health Check:</strong> Shows ML service status and cache statistics</li>
                    <li><strong>Custom Symbol:</strong> Test any stock or crypto symbol</li>
                </ul>
                <p style={styles.note}>
                    💡 <strong>Tip:</strong> If you see cached calls taking {"<"}10ms while initial calls take 200-500ms, 
                    the cache is working correctly!
                </p>
            </div>
        </div>
    );
};

// Styles
const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: '#0f172a',
        minHeight: '100vh',
        color: '#e2e8f0'
    },
    header: {
        marginBottom: '32px',
        borderBottom: '1px solid #334155',
        paddingBottom: '16px'
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        margin: '0 0 8px 0',
        color: '#f8fafc'
    },
    subtitle: {
        color: '#94a3b8',
        margin: 0
    },
    controlPanel: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '16px'
    },
    button: {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
        transition: 'all 0.2s'
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        color: 'white'
    },
    secondaryButton: {
        backgroundColor: '#334155',
        color: '#e2e8f0'
    },
    dangerButton: {
        backgroundColor: '#7f1d1d',
        color: '#fecaca'
    },
    customInput: {
        display: 'flex',
        gap: '12px'
    },
    input: {
        flex: 1,
        padding: '10px 16px',
        borderRadius: '8px',
        border: '1px solid #334155',
        backgroundColor: '#0f172a',
        color: '#e2e8f0',
        fontSize: '14px'
    },
    statsBar: {
        display: 'flex',
        gap: '24px',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '24px',
        flexWrap: 'wrap'
    },
    stat: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    statLabel: {
        fontSize: '12px',
        color: '#94a3b8',
        marginBottom: '4px'
    },
    statValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#f8fafc'
    },
    healthCard: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
    },
    cardTitle: {
        fontSize: '16px',
        fontWeight: '600',
        marginTop: 0,
        marginBottom: '16px',
        color: '#f8fafc'
    },
    pre: {
        backgroundColor: '#0f172a',
        padding: '16px',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: '13px',
        color: '#a5f3fc',
        margin: 0
    },
    resultsContainer: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        overflowX: 'auto'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '14px'
    },
    th: {
        textAlign: 'left',
        padding: '12px 16px',
        borderBottom: '2px solid #334155',
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    tr: {
        borderBottom: '1px solid #334155'
    },
    td: {
        padding: '12px 16px',
        color: '#e2e8f0'
    },
    loading: {
        animation: 'pulse 1s infinite'
    },
    success: {
        color: '#10b981'
    },
    error: {
        color: '#ef4444',
        cursor: 'help'
    },
    badge: {
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
    },
    instructions: {
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '20px'
    },
    list: {
        paddingLeft: '20px',
        lineHeight: '1.8',
        color: '#cbd5e1'
    },
    note: {
        backgroundColor: '#1e3a5f',
        padding: '12px 16px',
        borderRadius: '8px',
        marginTop: '16px',
        marginBottom: 0,
        borderLeft: '4px solid #3b82f6',
        color: '#93c5fd'
    }
};

export default PriceServiceTester;