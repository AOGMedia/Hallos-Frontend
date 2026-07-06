'use client';

import type { InputHTMLAttributes } from 'react';
import CheckboxIcon from '@/components/icons/CheckboxIcon';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}
// className = '',
export function Checkbox({ label,  ...props }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          className="sr-only peer"
          {...props}
        />
        <div className="w-4 h-4 border border-white rounded flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary transition-colors">
          <CheckboxIcon width={10} height={7} color="#FFFFFF" className="opacity-0 peer-checked:opacity-100" />
        </div>
      </div>
      {label && (
        <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">
          {label}
        </span>
      )}
    </label>
  );
}