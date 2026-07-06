import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-bold rounded-full transition-all duration-200';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-transparent border border-text-secondary text-text-secondary hover:bg-text-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed',
    outline: 'bg-transparent border border-border text-text-primary hover:border-text-primary disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-base',
  };
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}