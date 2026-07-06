import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const validSrc = src && src.trim() !== '' ? src : null;
  const initials = alt ? alt.charAt(0).toUpperCase() : '?';

  return (
    <div className={`${sizeStyles[size]} rounded-full overflow-hidden flex items-center justify-center bg-primary/20 text-primary font-bold text-xs ${className}`}>
      {validSrc ? (
        <Image
          src={validSrc}
          alt={alt}
          width={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
          height={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
          className="object-cover w-full h-full"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}