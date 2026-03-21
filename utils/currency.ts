export type CurrencyCode = 'NGN' | 'USD';

export const CURRENCIES: Record<CurrencyCode, { symbol: string; label: string }> = {
  NGN: { symbol: '₦', label: 'Naira' },
  USD: { symbol: '$', label: 'US Dollar' },
};

export const EXCHANGE_RATE = 1500; // Example: 1500 NGN = 1 USD (adjust as needed or fetch)

/**
 * Detects the user's currency based on their timezone.
 * Primary hint: Africa/ timezone suggests NGN.
 */
export const detectCurrency = (): CurrencyCode => {
  if (typeof window === 'undefined') return 'NGN'; // Default to NGN server-side

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone && timeZone.startsWith('Africa/')) {
      return 'NGN';
    }
  } catch (e) {
    console.warn('Failed to detect timezone for currency detection', e);
  }

  return 'USD';
};

/**
 * Formats a number as currency.
 * @param amount The amount to format
 * @param currency The currency code (NGN or USD)
 */
export const formatCurrency = (amount: number, currency: CurrencyCode): string => {
  const locale = currency === 'NGN' ? 'en-NG' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
