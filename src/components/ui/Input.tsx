import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function Input({ icon, className = '', ...props }: InputProps) {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <div className="absolute left-4 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={`w-full bg-transparent text-text-primary text-base px-4 py-3 ${
          icon ? 'pl-12' : ''
        } outline-none ${className}`}
        {...props}
      />
    </div>
  );
}