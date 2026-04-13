export type CurrencyCode = 'NGN' | 'USD' | 'KES' | 'GHS';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; label: string; flag: string }> = {
  NGN: { symbol: '₦', label: 'Nigeria', flag: '🇳🇬' },
  USD: { symbol: '$', label: 'United States', flag: '🇺🇸' },
  KES: { symbol: 'KSh', label: 'Kenya', flag: '🇰🇪' },
  GHS: { symbol: 'GH₵', label: 'Ghana', flag: '🇬🇭' },
};

/** Exchange rates relative to NGN (1 NGN = X foreign currency) */
export type ExchangeRates = Record<CurrencyCode, number>;

/** Static fallback rates – used before live data loads or if API fails */
export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  NGN: 1,
  USD: 1 / 1500,
  KES: 0.085,
  GHS: 0.01,
};

/** @deprecated Use DEFAULT_EXCHANGE_RATES.USD instead */
export const EXCHANGE_RATE = 1500;

/** @deprecated Use DEFAULT_EXCHANGE_RATES instead */
export const EXCHANGE_RATES_FROM_NGN: Record<CurrencyCode, number> = DEFAULT_EXCHANGE_RATES;

/**
 * Detects the user's preferred currency based on their timezone.
 */
export const detectCurrency = (): CurrencyCode => {
  if (typeof window === 'undefined') return 'NGN';

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone === 'Africa/Nairobi') return 'KES';
    if (timeZone === 'Africa/Accra') return 'GHS';
    if (['Africa/Lagos', 'Africa/Abuja'].includes(timeZone)) return 'NGN';
    if (timeZone?.startsWith('Africa/')) return 'NGN';
  } catch (e) {
    console.warn('Failed to detect timezone for currency detection', e);
  }

  return 'USD';
};

/**
 * Converts an amount from one currency to another using the provided rates.
 * All rates are expressed relative to NGN (1 NGN = X target currency).
 *
 * @param amount        The amount in fromCurrency
 * @param fromCurrency  The source currency code
 * @param toCurrency    The target currency code
 * @param rates         Exchange rates (default: static fallback)
 */
export const convertAmount = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): number => {
  if (fromCurrency === toCurrency) return amount;

  // Normalise to NGN first, then convert to target
  const amountInNgn = fromCurrency === 'NGN'
    ? amount
    : amount / rates[fromCurrency];

  return amountInNgn * rates[toCurrency];
};

/**
 * Formats a number as a localised currency string.
 */
export const formatCurrency = (amount: number, currency: CurrencyCode): string => {
  const localeMap: Record<CurrencyCode, string> = {
    NGN: 'en-NG',
    USD: 'en-US',
    KES: 'en-KE',
    GHS: 'en-GH',
  };

  return new Intl.NumberFormat(localeMap[currency], {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
