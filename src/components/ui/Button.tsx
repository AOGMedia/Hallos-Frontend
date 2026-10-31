import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const baseStyles = 'font-bold rounded-full transition-all duration-200';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
  secondary: 'bg-transparent border border-text-secondary text-text-secondary hover:bg-text-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed',
  outline: 'bg-transparent border border-border text-text-primary hover:border-text-primary disabled:opacity-50 disabled:cursor-not-allowed',
  danger: 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-base',
};

/**
 * Button styling for elements that navigate. Use on a `<Link>` instead of
 * nesting a link inside `<Button>` (a link inside a button is invalid HTML
 * and only the inner text is clickable).
 */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className = '',
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} cursor-pointer ${className}`;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
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
