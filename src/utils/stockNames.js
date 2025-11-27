// client/src/utils/stockNames.js - Company/Crypto name lookup utility

// Stock company names
const stockNames = {
    'AAPL': 'Apple Inc.',
    'GOOGL': 'Alphabet Inc.',
    'GOOG': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.',
    'AMD': 'Advanced Micro Devices',
    'INTC': 'Intel Corporation',
    'CRM': 'Salesforce Inc.',
    'ORCL': 'Oracle Corporation',
    'ADBE': 'Adobe Inc.',
    'PYPL': 'PayPal Holdings Inc.',
    'DIS': 'The Walt Disney Company',
    'COIN': 'Coinbase Global Inc.',
    'SQ': 'Block Inc.',
    'SHOP': 'Shopify Inc.',
    'UBER': 'Uber Technologies Inc.',
    'LYFT': 'Lyft Inc.',
    'SNAP': 'Snap Inc.',
    'PINS': 'Pinterest Inc.',
    'ZM': 'Zoom Video Communications',
    'ROKU': 'Roku Inc.',
    'SPOT': 'Spotify Technology',
    'BA': 'Boeing Company',
    'JPM': 'JPMorgan Chase & Co.',
    'V': 'Visa Inc.',
    'MA': 'Mastercard Inc.',
    'JNJ': 'Johnson & Johnson',
    'PG': 'Procter & Gamble',
    'KO': 'Coca-Cola Company',
    'PEP': 'PepsiCo Inc.',
    'WMT': 'Walmart Inc.',
    'HD': 'Home Depot Inc.',
    'NKE': 'Nike Inc.',
    'MCD': 'McDonald\'s Corporation',
    'SBUX': 'Starbucks Corporation',
    'GME': 'GameStop Corp.',
    'AMC': 'AMC Entertainment',
    'PLTR': 'Palantir Technologies',
    'RIVN': 'Rivian Automotive',
    'LCID': 'Lucid Group Inc.',
    'F': 'Ford Motor Company',
    'GM': 'General Motors',
    'T': 'AT&T Inc.',
    'VZ': 'Verizon Communications',
    'XOM': 'Exxon Mobil Corporation',
    'CVX': 'Chevron Corporation',
    'PFE': 'Pfizer Inc.',
    'MRNA': 'Moderna Inc.',
    'JNJ': 'Johnson & Johnson',
    'UNH': 'UnitedHealth Group',
    'BAC': 'Bank of America',
    'WFC': 'Wells Fargo & Co.',
    'C': 'Citigroup Inc.',
    'GS': 'Goldman Sachs',
    'MS': 'Morgan Stanley',
    'BLK': 'BlackRock Inc.',
    'SCHW': 'Charles Schwab',
    'SPGI': 'S&P Global Inc.',
    'AXP': 'American Express',
    'USB': 'U.S. Bancorp',
    'PNC': 'PNC Financial Services',
    'TFC': 'Truist Financial',
    'COF': 'Capital One Financial',
    'BK': 'Bank of New York Mellon',
    'STT': 'State Street Corporation',
    'TROW': 'T. Rowe Price',
    'NTRS': 'Northern Trust',
    'FRC': 'First Republic Bank',
    'SIVB': 'SVB Financial Group',
    'ALLY': 'Ally Financial',
    'SYF': 'Synchrony Financial',
    'DFS': 'Discover Financial',
    'HOOD': 'Robinhood Markets',
    'SOFI': 'SoFi Technologies',
    'UPST': 'Upstart Holdings',
    'LC': 'LendingClub',
    'AFRM': 'Affirm Holdings',
    'NU': 'Nu Holdings',
    'BILL': 'Bill.com Holdings',
    'MQ': 'Marqeta Inc.',
    'FOUR': 'Shift4 Payments',
    'GPN': 'Global Payments',
    'FIS': 'Fidelity National Info',
    'FISV': 'Fiserv Inc.',
    'ADP': 'Automatic Data Processing',
    'PAYX': 'Paychex Inc.',
    'INTU': 'Intuit Inc.',
    'NOW': 'ServiceNow Inc.',
    'WDAY': 'Workday Inc.',
    'TEAM': 'Atlassian Corporation',
    'DDOG': 'Datadog Inc.',
    'SNOW': 'Snowflake Inc.',
    'MDB': 'MongoDB Inc.',
    'CRWD': 'CrowdStrike Holdings',
    'ZS': 'Zscaler Inc.',
    'NET': 'Cloudflare Inc.',
    'OKTA': 'Okta Inc.',
    'PANW': 'Palo Alto Networks',
    'FTNT': 'Fortinet Inc.',
    'SPLK': 'Splunk Inc.',
    'ESTC': 'Elastic N.V.',
    'TWLO': 'Twilio Inc.',
    'TTD': 'The Trade Desk',
    'U': 'Unity Software',
    'RBLX': 'Roblox Corporation',
    'ABNB': 'Airbnb Inc.',
    'DASH': 'DoorDash Inc.',
    'ETSY': 'Etsy Inc.',
    'EBAY': 'eBay Inc.',
    'W': 'Wayfair Inc.',
    'CHWY': 'Chewy Inc.',
    'CVNA': 'Carvana Co.',
    'BKNG': 'Booking Holdings',
    'EXPE': 'Expedia Group',
    'MAR': 'Marriott International',
    'HLT': 'Hilton Worldwide',
    'H': 'Hyatt Hotels',
    'MGM': 'MGM Resorts',
    'LVS': 'Las Vegas Sands',
    'WYNN': 'Wynn Resorts',
    'CCL': 'Carnival Corporation',
    'RCL': 'Royal Caribbean',
    'NCLH': 'Norwegian Cruise Line',
    'DAL': 'Delta Air Lines',
    'UAL': 'United Airlines',
    'AAL': 'American Airlines',
    'LUV': 'Southwest Airlines',
    'ALK': 'Alaska Air Group',
    'JBLU': 'JetBlue Airways',
    'SAVE': 'Spirit Airlines',
    'PIF': 'Invesco DWA Financial Momentum ETF',
    'GUSH': 'Direxion Daily S&P Oil & Gas Bull 2X',
    'SPY': 'SPDR S&P 500 ETF',
    'QQQ': 'Invesco QQQ Trust',
    'IWM': 'iShares Russell 2000 ETF',
    'DIA': 'SPDR Dow Jones Industrial',
    'VTI': 'Vanguard Total Stock Market',
    'VOO': 'Vanguard S&P 500 ETF',
    'ARKK': 'ARK Innovation ETF',
    'ARKW': 'ARK Next Gen Internet ETF',
    'ARKG': 'ARK Genomic Revolution ETF',
    'ARKF': 'ARK Fintech Innovation ETF',
    'SOXL': 'Direxion Daily Semiconductor Bull 3X',
    'SOXS': 'Direxion Daily Semiconductor Bear 3X',
    'TQQQ': 'ProShares UltraPro QQQ',
    'SQQQ': 'ProShares UltraPro Short QQQ',
    'SPXL': 'Direxion Daily S&P 500 Bull 3X',
    'SPXS': 'Direxion Daily S&P 500 Bear 3X',
    'LABU': 'Direxion Daily S&P Biotech Bull 3X',
    'LABD': 'Direxion Daily S&P Biotech Bear 3X'
};

// Crypto names
const cryptoNames = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'XRP': 'Ripple',
    'LTC': 'Litecoin',
    'ADA': 'Cardano',
    'SOL': 'Solana',
    'DOGE': 'Dogecoin',
    'DOT': 'Polkadot',
    'BNB': 'BNB',
    'LINK': 'Chainlink',
    'UNI': 'Uniswap',
    'MATIC': 'Polygon',
    'SHIB': 'Shiba Inu',
    'TRX': 'Tron',
    'AVAX': 'Avalanche',
    'ATOM': 'Cosmos',
    'XMR': 'Monero',
    'ETC': 'Ethereum Classic',
    'XLM': 'Stellar',
    'ALGO': 'Algorand',
    'VET': 'VeChain',
    'FIL': 'Filecoin',
    'THETA': 'Theta Network',
    'ICP': 'Internet Computer',
    'HBAR': 'Hedera',
    'FTM': 'Fantom',
    'NEAR': 'NEAR Protocol',
    'GRT': 'The Graph',
    'SAND': 'The Sandbox',
    'MANA': 'Decentraland',
    'AXS': 'Axie Infinity',
    'APE': 'ApeCoin',
    'CRO': 'Cronos',
    'LDO': 'Lido DAO',
    'ARB': 'Arbitrum',
    'OP': 'Optimism',
    'IMX': 'Immutable X',
    'INJ': 'Injective',
    'SUI': 'Sui',
    'SEI': 'Sei',
    'TIA': 'Celestia',
    'JUP': 'Jupiter',
    'RENDER': 'Render Token',
    'FET': 'Fetch.ai',
    'RNDR': 'Render Token',
    'WIF': 'dogwifhat',
    'PEPE': 'Pepe',
    'FLOKI': 'Floki Inu',
    'BONK': 'Bonk'
};

/**
 * Get the name of a stock or crypto by its symbol
 * @param {string} symbol - The ticker symbol (e.g., 'AAPL', 'BTC')
 * @returns {string} - The company/crypto name or formatted symbol
 */
export const getAssetName = (symbol) => {
    if (!symbol) return 'Unknown';
    
    const upperSymbol = symbol.toUpperCase();
    
    // Check stocks first
    if (stockNames[upperSymbol]) {
        return stockNames[upperSymbol];
    }
    
    // Check crypto
    if (cryptoNames[upperSymbol]) {
        return cryptoNames[upperSymbol];
    }
    
    // Return formatted symbol as fallback
    return `${upperSymbol}`;
};

/**
 * Check if a symbol is a known cryptocurrency
 * @param {string} symbol - The ticker symbol
 * @returns {boolean}
 */
export const isCrypto = (symbol) => {
    if (!symbol) return false;
    return !!cryptoNames[symbol.toUpperCase()];
};

/**
 * Check if a symbol is a known stock
 * @param {string} symbol - The ticker symbol
 * @returns {boolean}
 */
export const isStock = (symbol) => {
    if (!symbol) return false;
    return !!stockNames[symbol.toUpperCase()];
};

export { stockNames, cryptoNames };