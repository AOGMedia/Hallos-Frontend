'use client';

import type { InputHTMLAttributes } from 'react';
import { useState } from 'react';
import EyeIcon from '@/components/icons/EyeIcon';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export function FormField({ 
  label, 
  error, 
  rightIcon,
  showPasswordToggle = false,
  type = 'text',
  className = '',
  ...props 
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`auth-input w-full ${className}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <EyeIcon width={16} height={14} color="#EAEAEA" />
          </button>
        )}
        {rightIcon && !showPasswordToggle && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-accent-red">{error}</span>
      )}
    </div>
  );
}