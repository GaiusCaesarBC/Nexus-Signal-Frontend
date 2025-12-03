// client/src/utils/priceFormatter.js - Universal Price Formatting Utility

/**
 * Smart price formatter that shows appropriate decimal places based on price magnitude
 * Handles very small prices like 0.00000250 without truncation
 * 
 * @param {number|string} price - The price to format
 * @param {object} options - Formatting options
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, options = {}) => {
    // Handle null, undefined, or invalid prices
    if (price == null || price === '' || isNaN(price)) {
        return options.showCurrency ? '$0.00' : '0.00';
    }

    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Handle zero
    if (numPrice === 0) {
        return options.showCurrency ? '$0.00' : '0.00';
    }

    // Default options
    const {
        showCurrency = false,      // Prepend $ symbol
        minDecimals = null,         // Force minimum decimal places
        maxDecimals = null,         // Force maximum decimal places
        compact = false             // Use compact notation for large numbers (1.2M, 1.5B)
    } = options;

    let formatted;
    const absPrice = Math.abs(numPrice);

    // Use custom decimals if specified
    if (maxDecimals !== null) {
        formatted = numPrice.toFixed(maxDecimals);
    }
    // Compact notation for large numbers (optional)
    else if (compact && absPrice >= 1000000) {
        if (absPrice >= 1000000000) {
            formatted = (numPrice / 1000000000).toFixed(2) + 'B';
        } else if (absPrice >= 1000000) {
            formatted = (numPrice / 1000000).toFixed(2) + 'M';
        } else {
            formatted = (numPrice / 1000).toFixed(2) + 'K';
        }
    }
    // Smart decimal places based on price magnitude
    else if (absPrice < 0.000001) {
        // Very tiny prices (< 0.000001): Show 10 decimals
        formatted = numPrice.toFixed(10);
    } else if (absPrice < 0.0001) {
        // Micro prices (< 0.0001): Show 8 decimals
        formatted = numPrice.toFixed(8);
    } else if (absPrice < 0.01) {
        // Small prices (< 0.01): Show 6 decimals
        formatted = numPrice.toFixed(6);
    } else if (absPrice < 1) {
        // Fractional prices (< 1): Show 4 decimals
        formatted = numPrice.toFixed(4);
    } else if (absPrice < 100) {
        // Regular prices (< 100): Show 2 decimals
        formatted = numPrice.toFixed(2);
    } else {
        // Large prices (>= 100): Show 2 decimals
        formatted = numPrice.toFixed(2);
    }

    // Remove trailing zeros after decimal point (unless minDecimals is set)
    if (minDecimals === null) {
        formatted = parseFloat(formatted).toString();
    }

    // Add thousands separators for whole numbers
    const parts = formatted.split('.');
    if (parts[0].length > 3 && !compact) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        formatted = parts.join('.');
    }

    // Add currency symbol if requested
    if (showCurrency && !compact) {
        formatted = '$' + formatted;
    }

    return formatted;
};

/**
 * Format price with currency symbol
 * Shorthand for formatPrice(price, { showCurrency: true })
 */
export const formatCurrency = (price, options = {}) => {
    return formatPrice(price, { ...options, showCurrency: true });
};

/**
 * Format price change (with + or - sign and color coding info)
 * @returns {object} - { formatted, colorClass, isPositive }
 */
export const formatPriceChange = (change, isPercentage = false) => {
    if (change == null || isNaN(change)) {
        return {
            formatted: isPercentage ? '0.00%' : '$0.00',
            colorClass: 'text-gray-400',
            isPositive: null
        };
    }

    const numChange = typeof change === 'string' ? parseFloat(change) : change;
    const isPositive = numChange > 0;
    const isNegative = numChange < 0;

    let formatted;
    if (isPercentage) {
        // Format as percentage
        formatted = Math.abs(numChange).toFixed(2) + '%';
    } else {
        // Format as currency
        formatted = formatCurrency(Math.abs(numChange));
    }

    // Add sign
    if (isPositive) {
        formatted = '+' + formatted;
    } else if (isNegative) {
        formatted = '-' + formatted;
    }

    return {
        formatted,
        colorClass: isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-400',
        isPositive: isPositive ? true : isNegative ? false : null
    };
};

/**
 * Format market cap or large numbers
 * Uses compact notation (M, B, T)
 */
export const formatMarketCap = (value) => {
    return formatPrice(value, { compact: true, showCurrency: true });
};

/**
 * Format volume
 * Uses compact notation without currency
 */
export const formatVolume = (value) => {
    return formatPrice(value, { compact: true, showCurrency: false });
};

/**
 * Format cryptocurrency price (always show many decimals)
 */
export const formatCryptoPrice = (price) => {
    if (price == null || isNaN(price)) return '$0.00';
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const absPrice = Math.abs(numPrice);

    let decimals;
    if (absPrice < 0.000001) {
        decimals = 10;
    } else if (absPrice < 0.0001) {
        decimals = 8;
    } else if (absPrice < 0.01) {
        decimals = 6;
    } else if (absPrice < 1) {
        decimals = 4;
    } else {
        decimals = 2;
    }

    return '$' + numPrice.toFixed(decimals);
};

/**
 * Format stock price (typically 2-4 decimals)
 */
export const formatStockPrice = (price) => {
    if (price == null || isNaN(price)) return '$0.00';
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    const absPrice = Math.abs(numPrice);

    // Stocks rarely go below $0.01, but handle it just in case
    const decimals = absPrice < 1 ? 4 : 2;
    return '$' + numPrice.toFixed(decimals);
};

// Export all formatters
export default {
    formatPrice,
    formatCurrency,
    formatPriceChange,
    formatMarketCap,
    formatVolume,
    formatCryptoPrice,
    formatStockPrice
};