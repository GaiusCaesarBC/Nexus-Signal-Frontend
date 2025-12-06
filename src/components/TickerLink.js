import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Known crypto symbols - add more as needed
const CRYPTO_SYMBOLS = new Set([
  'BTC', 'ETH', 'XRP', 'LTC', 'ADA', 'SOL', 'DOGE', 'DOT', 'BNB', 'LINK',
  'UNI', 'MATIC', 'SHIB', 'TRX', 'AVAX', 'ATOM', 'XMR', 'ALGO', 'VET', 'FIL',
  'THETA', 'FTM', 'MANA', 'SAND', 'AXS', 'AAVE', 'MKR', 'COMP', 'SNX', 'CRV',
  'SUSHI', 'YFI', 'UMA', 'BAL', 'REN', 'KNC', 'LRC', 'ZRX', 'BAT', 'ENJ',
  'CHZ', 'HBAR', 'XTZ', 'EOS', 'NEO', 'IOTA', 'XLM', 'DASH', 'ZEC', 'ETC',
  'WAVES', 'QTUM', 'OMG', 'ICX', 'ZIL', 'ONT', 'NANO', 'BTT', 'HOT', 'CELR',
  'ONE', 'FET', 'ANKR', 'CKB', 'STORJ', 'BAND', 'KAVA', 'RSR', 'NKN', 'OGN',
  'CELO', 'AR', 'ROSE', 'FLOW', 'NEAR', 'ICP', 'RUNE', 'LUNA', 'EGLD', 'KSM',
  'CAKE', 'PEPE', 'WIF', 'BONK', 'FLOKI', 'APE', 'GMT', 'OP', 'ARB', 'SUI',
  'SEI', 'TIA', 'INJ', 'PYTH', 'JUP', 'WLD', 'STRK', 'MEME', 'ORDI', 'BLUR',
  // CoinGecko IDs (lowercase)
  'bitcoin', 'ethereum', 'ripple', 'litecoin', 'cardano', 'solana', 'dogecoin',
  'polkadot', 'binancecoin', 'chainlink', 'uniswap', 'matic-network', 'shiba-inu',
  'tron', 'avalanche-2', 'cosmos', 'monero'
]);

// Check if symbol is crypto
const isCrypto = (symbol) => {
  if (!symbol) return false;
  const upperSymbol = symbol.toUpperCase();
  const lowerSymbol = symbol.toLowerCase();
  return CRYPTO_SYMBOLS.has(upperSymbol) || CRYPTO_SYMBOLS.has(lowerSymbol);
};

// Styled ticker link
const StyledTickerLink = styled.span`
  color: ${props => props.$color || (props.$isCrypto ? '#f7931a' : '#667eea')};
  font-weight: ${props => props.$bold ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: ${props => props.$isCrypto ? '#ffcd00' : '#8b9ff8'};
    text-decoration: underline;
    transform: translateX(2px);
  }

  ${props => props.$showBadge && `
    &::after {
      content: '${props.$isCrypto ? '₿' : '📈'}';
      font-size: 0.8em;
      opacity: 0.7;
    }
  `}
`;

// Badge variants
const TickerBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: ${props => props.$size || '14px'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  background: ${props => props.$isCrypto 
    ? 'rgba(247, 147, 26, 0.15)' 
    : 'rgba(102, 126, 234, 0.15)'};
  color: ${props => props.$isCrypto ? '#f7931a' : '#667eea'};
  border: 1px solid ${props => props.$isCrypto 
    ? 'rgba(247, 147, 26, 0.3)' 
    : 'rgba(102, 126, 234, 0.3)'};

  &:hover {
    background: ${props => props.$isCrypto 
      ? 'rgba(247, 147, 26, 0.25)' 
      : 'rgba(102, 126, 234, 0.25)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => props.$isCrypto 
      ? 'rgba(247, 147, 26, 0.2)' 
      : 'rgba(102, 126, 234, 0.2)'};
  }
`;

/**
 * TickerLink Component
 *
 * A clickable ticker symbol that links to the appropriate stock or crypto page.
 * Automatically detects if the symbol is a cryptocurrency.
 *
 * @param {string} symbol - The ticker symbol (e.g., "AAPL", "BTC", "ETH")
 * @param {boolean} forceCrypto - Force the symbol to be treated as crypto
 * @param {boolean} forceStock - Force the symbol to be treated as a stock
 * @param {string} variant - "text" (default), "badge", or "plain"
 * @param {boolean} showBadge - Show crypto/stock badge icon
 * @param {boolean} bold - Make text bold
 * @param {string} color - Custom color override
 * @param {string} size - Font size (for badge variant)
 * @param {string} className - Additional CSS class
 * @param {function} onClick - Additional click handler
 * @param {React.ReactNode} children - Custom content (defaults to symbol)
 * @param {boolean} isDex - Is this a DEX token (GeckoTerminal)
 * @param {string} network - DEX network (bsc, eth, solana)
 * @param {string} poolAddress - DEX pool address
 */
const TickerLink = ({
  symbol,
  forceCrypto = false,
  forceStock = false,
  variant = 'text',
  showBadge = false,
  bold = false,
  color,
  size,
  className,
  onClick,
  children,
  isDex = false,
  network,
  poolAddress,
  ...props
}) => {
  const navigate = useNavigate();

  if (!symbol) return null;

  const upperSymbol = symbol.toUpperCase();
  const crypto = forceStock ? false : (forceCrypto || isDex || isCrypto(symbol));

  // Build path - DEX tokens include network and poolAddress as query params
  let path;
  if (isDex && network && poolAddress) {
    path = `/crypto/${upperSymbol}?source=dex&network=${network}&pool=${poolAddress}`;
  } else {
    path = crypto ? `/crypto/${upperSymbol}` : `/stocks/${upperSymbol}`;
  }
  
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent parent click handlers
    if (onClick) onClick(e);
    navigate(path);
  };

  const content = children || upperSymbol;

  if (variant === 'badge') {
    return (
      <TickerBadge 
        $isCrypto={crypto}
        $size={size}
        onClick={handleClick}
        className={className}
        {...props}
      >
        {content}
      </TickerBadge>
    );
  }

  if (variant === 'plain') {
    return (
      <span 
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
        className={className}
        {...props}
      >
        {content}
      </span>
    );
  }

  // Default: text variant
  return (
    <StyledTickerLink 
      $isCrypto={crypto}
      $showBadge={showBadge}
      $bold={bold}
      $color={color}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {content}
    </StyledTickerLink>
  );
};

/**
 * TickerText Component
 * 
 * Parses text and automatically converts $SYMBOL mentions to clickable links.
 * 
 * @param {string} text - Text containing $SYMBOL mentions
 * @param {object} linkProps - Props to pass to TickerLink components
 */
export const TickerText = ({ text, linkProps = {} }) => {
  if (!text) return null;

  // Match $SYMBOL patterns (1-10 uppercase letters/numbers after $)
  const parts = text.split(/(\$[A-Za-z]{1,10})/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$')) {
          const symbol = part.slice(1); // Remove the $
          return (
            <TickerLink 
              key={index} 
              symbol={symbol} 
              {...linkProps}
            >
              {part}
            </TickerLink>
          );
        }
        return part;
      })}
    </>
  );
};

/**
 * Helper hook to navigate to ticker pages
 */
export const useTickerNavigation = () => {
  const navigate = useNavigate();

  const goToTicker = (symbol, forceCrypto = false, forceStock = false) => {
    if (!symbol) return;
    const upperSymbol = symbol.toUpperCase();
    const crypto = forceStock ? false : (forceCrypto || isCrypto(symbol));
    const path = crypto ? `/crypto/${upperSymbol}` : `/stocks/${upperSymbol}`;
    navigate(path);
  };

  return { goToTicker, isCrypto };
};

// Export the isCrypto helper for external use
export { isCrypto };

export default TickerLink;