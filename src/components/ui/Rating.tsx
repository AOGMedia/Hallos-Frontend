import StarFilledIcon from '@/components/icons/StarFilledIcon';
import StarIcon from '@/components/icons/StarIcon';

interface RatingProps {
  rating: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Rating({ rating, showValue = false, size = 'md', className = '' }: RatingProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 40,
  };
  
  const iconSize = sizeMap[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);
  
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div className="flex gap-2">
        {/* Filled stars */}
        {[...Array(fullStars)].map((_, i) => (
          <StarFilledIcon key={`filled-${i}`} width={iconSize} height={iconSize} />
        ))}
        
        {/* Half star (if needed) */}
        {hasHalfStar && (
          <div key="half" className="relative">
            <StarIcon width={iconSize} height={iconSize} />
            <div 
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: '50%' }}
            >
              <StarFilledIcon width={iconSize} height={iconSize} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} width={iconSize} height={iconSize} />
        ))}
      </div>
      {showValue && (
        <span className={`font-bold ${size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-sm'}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}