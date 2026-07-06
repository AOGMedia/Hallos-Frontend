import { SelectHTMLAttributes } from 'react';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, error, options, className = '', ...props }: FormSelectProps) {
  return (
    <div className="w-full">
      <label className="block text-sm text-text-muted mb-2">{label}</label>
      <div className="relative">
        <select
          className={`w-full bg-black border border-border rounded-lg px-4 py-3 text-white 
            appearance-none focus:border-primary focus:outline-none transition-colors
            disabled:cursor-not-allowed disabled:opacity-75 ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-black text-white">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
