'use client';

import { memo } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const ToggleSwitch = memo(function ToggleSwitch({ 
  checked, 
  onChange, 
  label,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center  gap-6 ">
      {label && (
        <span className="live-event-input-text">
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
        } ${
          checked ? ' border border-primary'  : 'border border-[#888c94]'
        }`}
      >
        <span
          className={`absolute top-1 left-0 w-4 h-4  rounded-full transition-transform ${
            checked ? 'translate-x-5 bg-primary'  : 'translate-x-1 bg-[#888C94]'
          }`}
        />
      </button>
    </div>
  );
});