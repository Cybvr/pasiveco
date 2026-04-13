'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CurrencyCode, ExchangeRates, DEFAULT_EXCHANGE_RATES, detectCurrency } from '@/utils/currency';

const CURRENCY_STORAGE_KEY = 'pasive_currency';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: ExchangeRates;
  isLoading: boolean;
  ratesSource: 'live' | 'fallback' | 'loading';
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('NGN');
  const [rates, setRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [isLoading, setIsLoading] = useState(true);
  const [ratesSource, setRatesSource] = useState<'live' | 'fallback' | 'loading'>('loading');

  // Restore saved currency preference
  useEffect(() => {
    try {
      const savedCurrency = window.localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
      setCurrencyState(savedCurrency || detectCurrency());
    } catch {
      setCurrencyState(detectCurrency());
    }
    setIsLoading(false);
  }, []);

  // Fetch live exchange rates from our API route (cached 1hr by Next.js)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/exchange-rates');
        if (!res.ok) throw new Error('Failed to fetch rates');
        const data = await res.json();
        setRates(data.rates as ExchangeRates);
        setRatesSource(data.source === 'live' ? 'live' : 'fallback');
      } catch {
        // Keep DEFAULT_EXCHANGE_RATES as fallback
        setRatesSource('fallback');
      }
    };

    void fetchRates();
  }, []);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch {}
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, isLoading, ratesSource }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
