// Format currency amounts
export const formatCurrency = (amount: number): string => {
  const absAmount = Math.abs(amount);
  
  // Use Intl.NumberFormat for proper currency formatting
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absAmount);
    
    return amount < 0 ? `-${formatted}` : formatted;
  } catch {
    return absAmount.toFixed(2);
  }
};

export const formatCurrencyWithSymbol = (amount: number, currency = 'NGN'): string => {
  const symbol = getCurrencySymbol(currency);
  const formatted = formatCurrency(amount);
  return amount < 0 ? `-${symbol}${formatted.replace('-', '')}` : `${symbol}${formatted}`;
};

export const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case 'NGN': return '₦';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return currency;
  }
};