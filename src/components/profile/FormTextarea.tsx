import { TextareaHTMLAttributes } from 'react';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function FormTextarea({ label, error, className = '', ...props }: FormTextareaProps) {
  return (
    <div className="w-full">
      <label className="block text-sm text-text-muted mb-2">{label}</label>
      <textarea
        className={`w-full bg-background-dark/50 border border-border rounded-lg px-4 py-3 text-text-primary 
          focus:border-primary focus:outline-none transition-colors resize-none
          disabled:cursor-not-allowed disabled:opacity-75 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
