import { useState, useEffect } from 'react';

type Currency = 'USD' | 'NGN';

const CURRENCY_STORAGE_KEY = 'preferred-currency';

export const useCurrencyPreference = () => {
  const [currency, setCurrencyState] = useState<Currency>('NGN');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load currency preference from localStorage on mount
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency;
      if (savedCurrency && (savedCurrency === 'USD' || savedCurrency === 'NGN')) {
        setCurrencyState(savedCurrency);
      }
    } catch (error) {
      console.warn('Failed to load currency preference:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Update currency and persist to localStorage
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
    } catch (error) {
      console.warn('Failed to save currency preference:', error);
    }
  };

  return {
    currency,
    setCurrency,
    isLoaded, // Use this to prevent flash of default currency
  };
};