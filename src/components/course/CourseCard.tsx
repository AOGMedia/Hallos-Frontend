import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import ClockIcon from '@/components/icons/ClockIcon';
import UploadIcon from '@/components/icons/UploadIcon';
import StarIcon from '@/components/icons/StarIcon';
import BookmarkIcon from '@/components/icons/BookmarkIcon';

interface CourseCardProps {
  id?: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  avatar: string;
  price?: number ;
  currency?: string;
  duration: string;
  posted: string;
  rating: number;
  reviews: string;
  isLive?: boolean;
  scheduledFor?: string; // ISO date string for scheduled classes
  isLandingPage?: boolean; 
  // Optional purchase-related props
  isPurchased?: boolean;
  
  // Optional navigation override
  href?: string;
}

export function CourseCard({
  id,
  title,
  description,
  instructor,
  thumbnail,
  avatar,
  price,
  currency = 'NGN',
  duration,
  posted,
  rating,
  reviews,
  isLive = false,
  scheduledFor,
  isPurchased = false,
  href,
  isLandingPage = false,
}: CourseCardProps) {
  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    
    switch (currency) {
      case 'USD':
        return `$${price.toFixed(2)}`;
      case 'EUR':
        return `€${price.toFixed(2)}`;
      case 'GBP':
        return `£${price.toFixed(2)}`;
      case 'NGN':
      default:
        return `₦${price}`;
    }
  };

  // Format scheduled date/time — use UTC to avoid timezone offset
  const formatScheduledTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      const h = date.getUTCHours();
      const m = date.getUTCMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour = h % 12 || 12;
      const min = m.toString().padStart(2, '0');
      const timeStr = `${hour}:${min} ${ampm}`;

      if (diffDays === 0 && diffHours >= 0) {
        return timeStr;
      }

      if (diffDays > 0 && diffDays < 7) {
        const weekday = date.toLocaleDateString([], { weekday: 'short' });
        return `${weekday} ${timeStr}`;
      }

      const month = date.toLocaleDateString([], { month: 'short' });
      const day = date.getUTCDate();
      return `${month} ${day}, ${timeStr}`;
    } catch {
      return 'TBA';
    }
  };

  // Determine the navigation URL based on content type and availability
  const getNavigationUrl = () => {
    // If an explicit href is provided, use it
    if (href) return href;
    
    if (!id) return null;
    
    // For purchased content, check if it's live or video
    if (isPurchased) {
      if (isLive) {
        return `/live/${id}`;
      } else {
        return `/dashboard/video/${id}`;
      }
    }

    if (isLandingPage) {
      return `/dashboard/classes`;
    }
    
    // Default to video for non-purchased content
    return `/dashboard/video/${id}`;
  };

  const navigationUrl = getNavigationUrl();
  const isClickable = !!navigationUrl;

  // Render purchased card with new design
  if (isPurchased) {
    const purchasedCardContent = (
      <div className="relative w-full h-[350px] rounded-2xl border border-white/10 overflow-hidden hover:border-primary/50 transition-all cursor-pointer group">
        <Image 
          src={thumbnail} 
          alt={title} 
          fill
          className="object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
        
        {/* Top Section - Price & Checkmark */}
        <div className="absolute top-0 left-0 right-0 h-[60px] flex items-center justify-end px-6 gap-2.5">
          <span className="text-xs font-bold text-white leading-3">
            {price !== undefined ? formatPrice(Number(price), currency) : ''}
          </span>
          <Image 
            src="/icons/check-circle-green.svg" 
            alt="Purchased" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        </div>
        
        {/* Bottom Section - Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-4">
          <div className="flex gap-4">
            {/* Text Content */}
            <div className="flex-1 flex flex-col gap-2.5 min-w-0 overflow-hidden">
              {/* Instructor Name */}
              <span className="text-xs font-normal text-white leading-3 truncate block">
                {instructor}
              </span>
              
              {/* Title & Description */}
              <div className="flex flex-col gap-2.5">
                <h3 className="text-base font-bold text-white leading-5 truncate block min-h-[20px]">
                  {title}
                </h3>
                <p className="text-sm font-normal text-white/80 leading-[21px] line-clamp-2 min-h-[42px]">
                  {description}
                </p>
              </div>
            </div>
            
            {/* Profile Picture */}
            {avatar && avatar.trim() !== '' && (
              <div className="flex-shrink-0">
                <Image 
                  src={avatar} 
                  alt={instructor}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border-none"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Unavailable content overlay */}
        {!isClickable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-sm font-medium">Content Unavailable</span>
          </div>
        )}
      </div>
    );

    if (isClickable && navigationUrl) {
      return (
        <Link href={navigationUrl} className="block h-full">
          {purchasedCardContent}
        </Link>
      );
    }

    return purchasedCardContent;
  }

  // Original card design for non-purchased content
  const cardClassName = `overflow-hidden hover:border-primary/50 transition-all cursor-pointer group h-full  flex flex-col justify-between `;

  const cardContent = (
    <Card variant="default" className={cardClassName}>
      <div className="relative">
        <Image 
          src={thumbnail || '/placeholder-community.jpg'} 
          alt={title} 
          width={350} 
          height={210}
          className="w-full h-[210px] object-cover"
        />
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Badge variant="price">{price !== undefined ? formatPrice(Number(price), currency) : ''}</Badge>
          <button className="p-2 rounded-full hover:bg-background-dark transition-colors">
            <BookmarkIcon width={16} height={20} color="#F2F2F2" />
          </button>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col justify-between gap-6 overflow-hidden"> 
        <div className="flex gap-3 overflow-hidden">
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="min-h-[32px] flex items-center overflow-hidden">
              {isLive && (
                <Badge variant="live" className="max-w-full">
                  <span className="w-4 h-4 rounded-full bg-accent-red flex-shrink-0" />
                  <span className="flex-shrink-0">Live</span>
                  <span className="text-text-primary truncate ml-1">{instructor}</span>
                </Badge>
              )}
              {!isLive && scheduledFor && (
                <Badge variant='notlive' className="max-w-full flex items-center gap-1">
                  <span className="text-primary truncate text-[10px] min-w-0 flex-1">{instructor}</span>
                  <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap flex-shrink-0">
                    Starts: {formatScheduledTime(scheduledFor)}
                  </span>
                </Badge>
              )}
              {!isLive && !scheduledFor && (
                <Badge variant='notlive' className="max-w-full">
                  <span className="text-small truncate">{instructor}</span>
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col gap-2 overflow-hidden">
                <h3 className="font-bold text-base leading-5 truncate block min-h-[20px]">{title}</h3>
                <p className="text-sm leading-[21px] text-text-muted line-clamp-2 min-h-[42px]">{description}</p>
              </div>
          </div>
          
          <Avatar src={avatar} alt={instructor} size="md" />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <ClockIcon width={24} height={24} color="#F2F2F2" />
              <span className="text-small">{duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UploadIcon width={17} height={18} color="#F2F2F2" />
              <span className="text-small">{posted}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StarIcon width={21} height={21} color="#FFD42A" />
            <span className="text-small">{rating} ({reviews})</span>
          </div>
        </div>
      </div>
    </Card>
  );

  if (isClickable && navigationUrl) {
    return (
      <Link href={navigationUrl} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}