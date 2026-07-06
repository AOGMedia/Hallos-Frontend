'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { CurrencyCode } from '@/types/videoUpload';
import ChevronDownTinyIcon from '@/components/icons/ChevronDownTinyIcon';

interface CurrencySelectProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
}

const currencies = [
  { code: CurrencyCode.NGN, label: 'NGN' },
  { code: CurrencyCode.USD, label: 'USD' },
];

export const CurrencySelect = memo(function CurrencySelect({
  value,
  onChange
}: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 live-event-input-text hover:opacity-70 transition-opacity"
      >
        <span>{value}</span>
        <ChevronDownTinyIcon width={12} height={6} color="rgba(234, 234, 234, 0.50)" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-background-dark border border-border rounded-md shadow-lg z-10 min-w-[80px]">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              type="button"
              onClick={() => {
                onChange(currency.code);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-primary/10 transition-colors ${
                value === currency.code ? 'bg-primary/20 text-primary' : 'text-text-primary'
              }`}
            >
              {currency.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});