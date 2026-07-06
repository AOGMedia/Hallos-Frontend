interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'feature' | 'testimonial';
  className?: string;
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const variantStyles = {
    default: 'glass-effect rounded-2xl',
    glass: 'glass-effect rounded-2xl backdrop-blur-xl',
    feature: 'bg-background-dark rounded-lg p-8',
    testimonial: 'bg-background-dark rounded-xl p-6',
  };
  
  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}