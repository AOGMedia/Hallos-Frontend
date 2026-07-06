'use client';

import { memo, useState, useRef, useEffect, type ReactElement } from 'react';
import Image from 'next/image';

export interface DropdownOption<T> { value: T; label: string; }

interface DropdownProps<T> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

export const EarningsDropdown = memo(function EarningsDropdown<T extends string>({
  value, options, onChange, className = '',
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-2.5 py-3.5 rounded-[5px] border-[0.5px] border-[rgba(136,140,148,0.5)] hover:border-[rgba(136,140,148,0.7)] transition-colors"
      >
        <span className="text-xs font-medium text-text-primary tracking-[0.3px] whitespace-nowrap">
          {selected?.label || value}
        </span>
        <Image
          src="/icons/chevron-down.svg"
          alt=""
          width={17}
          height={9}
          style={{ filter: 'brightness(0) saturate(100%) invert(61%) sepia(6%) saturate(340%) hue-rotate(177deg) brightness(91%) contrast(84%)' }}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-background-dark border border-border rounded-md shadow-lg z-10 min-w-full">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full px-3 py-2 text-left text-xs hover:bg-primary/10 transition-colors whitespace-nowrap ${
                value === opt.value ? 'bg-primary/20 text-primary' : 'text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}) as <T extends string>(props: DropdownProps<T>) => ReactElement;
