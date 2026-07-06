'use client';

import React from 'react';
import { Check } from 'lucide-react';

export type Frequency = 'daily' | 'weekly' | 'both' | 'none';

interface FrequencyOption {
  id: Frequency;
  title: string;
  description: string;
}

const OPTIONS: FrequencyOption[] = [
  {
    id: 'daily',
    title: 'Daily Summary',
    description: 'Every day at 8:00 AM UTC',
  },
  {
    id: 'weekly',
    title: 'Weekly Digest',
    description: 'Every Monday at 8:00 AM UTC',
  },
  {
    id: 'both',
    title: 'Both Daily & Weekly',
    description: 'Summaries every day and every Monday',
  },
  {
    id: 'none',
    title: 'None',
    description: 'Recommended: Only manual checks',
  },
];

interface FrequencySelectorProps {
  value: Frequency;
  onChange: (value: Frequency) => void;
  disabled?: boolean;
}

export function FrequencySelector({ value, onChange, disabled = false }: FrequencySelectorProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {OPTIONS.map((option) => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => !disabled && onChange(option.id)}
            disabled={disabled}
            className={`flex flex-col items-start text-left p-4 rounded-2xl border-2 transition-all duration-200 outline-none group ${
              isSelected
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                {option.title}
              </span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                isSelected ? 'border-primary bg-primary' : 'border-white/20 group-hover:border-white/30'
              }`}>
                {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
              </div>
            </div>
            <p className={`text-xs leading-relaxed transition-colors ${isSelected ? 'text-text-primary/70' : 'text-text-muted'}`}>
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
