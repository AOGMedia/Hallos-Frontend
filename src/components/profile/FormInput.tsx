import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({ label, error, className = '', ...props }: FormInputProps) {
  return (
    <div className="w-full">
      <label className="block text-sm text-text-muted mb-2">{label}</label>
      <input
        className={`w-full bg-background-dark/50 border border-border rounded-lg px-4 py-3 text-text-primary 
          focus:border-primary focus:outline-none transition-colors
          disabled:cursor-not-allowed disabled:opacity-75 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
