/**
 * Fixed Exchange Rates for Currency Conversion
 *
 * These rates are used to convert foreign stock prices to KRW.
 * For educational purposes, we use fixed rates rather than real-time rates.
 *
 * Update these values periodically to reflect current market rates.
 * Last updated: 2025-01-21
 */

export const EXCHANGE_RATES: Record<string, number> = {
  KRW: 1,       // Korean Won (base currency)
  USD: 1330,    // US Dollar
  EUR: 1450,    // Euro
  JPY: 9.5,     // Japanese Yen (per 1 JPY)
  CHF: 1500,    // Swiss Franc
  GBP: 1680,    // British Pound
  CNY: 183,     // Chinese Yuan
};

/**
 * Convert a price from one currency to KRW
 * @param amount - The amount in the source currency
 * @param currency - The source currency code (e.g., 'USD', 'EUR')
 * @returns The amount converted to KRW
 */
export function convertToKRW(amount: number, currency: string): number {
  const rate = EXCHANGE_RATES[currency.toUpperCase()];

  if (!rate) {
    throw new Error(`Exchange rate not found for currency: ${currency}`);
  }

  return Math.round(amount * rate);
}

/**
 * Get currency code based on market
 * @param market - Stock market (e.g., 'NASDAQ', 'KOSPI')
 * @returns Currency code
 */
export function getCurrencyFromMarket(market: string): string {
  const marketUpper = market.toUpperCase();

  // Korean markets
  if (marketUpper === 'KOSPI' || marketUpper === 'KOSDAQ') {
    return 'KRW';
  }

  // US markets
  if (marketUpper === 'NASDAQ' || marketUpper === 'NYSE' || marketUpper === 'OTC') {
    return 'USD';
  }

  // Default to USD for other markets
  return 'USD';
}

/**
 * Get region based on market
 * @param market - Stock market (e.g., 'NASDAQ', 'KOSPI')
 * @returns Region name
 */
export function getRegionFromMarket(market: string): string {
  const marketUpper = market.toUpperCase();

  if (marketUpper === 'KOSPI' || marketUpper === 'KOSDAQ') {
    return 'Korea';
  }

  if (marketUpper === 'NASDAQ' || marketUpper === 'NYSE') {
    return 'US';
  }

  if (marketUpper === 'OTC') {
    return 'Global';
  }

  return 'Global';
}

/**
 * Convert price to KRW if needed based on currency
 * @param price - The price in original currency
 * @param currency - The currency code
 * @returns Price in KRW
 */
export function ensurePriceInKRW(price: number, currency: string): number {
  if (currency.toUpperCase() === 'KRW') {
    return price;
  }

  return convertToKRW(price, currency);
}
