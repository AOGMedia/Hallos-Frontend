"use client";
import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import ClockIcon from '@/components/icons/ClockIcon';
import StarFilledIcon from '@/components/icons/StarFilledIcon';
import { formatDuration, formatTimeAgo, formatRating } from '@/utils/formatters';
import { checkAccess } from '@/lib/api/payments';
import type { CheckAccessResponse } from '@/lib/api/payments';
import { usePaymentStore } from '@/store/paymentStore';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useCurrentUser } from '@/hooks/useCurrentUser'; 
import { TrashIcon } from 'lucide-react';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    author: string;
    authorAvatar: string;
    isLive: boolean;
    duration: number;
    postedDate: Date;
    rating: number;
    ratingCount: number;
    price?: number | string;
    currency?: string;
    userId?: string | number; // Creator/owner ID for access control
  };
  showPrice?: boolean;
  priceLabel?: string;
  variant?: 'grid' | 'carousel';
  className?: string;
  onDelete?: (e: React.MouseEvent) => void;
}

export function VideoCard({ video, showPrice = true, priceLabel = '₦ 16.00', variant = 'carousel', className = '', onDelete }: VideoCardProps) {
    const [isChecking, setIsChecking] = useState(false);
  const { user } = useCurrentUser(); // Get current user for creator access check

  const base = "video-card overflow-hidden relative group block";
  const variantCls = variant === 'carousel' ? "flex-shrink-0 w-full sm:w-[320px] lg:w-[352px]" : "w-full";
  const router = useRouter();

  type CheckAccessResponseExtended = CheckAccessResponse & { isFree?: boolean };
  const {
    isInitializing,
    isVerifying,
    setError,
    openModal,
    setPriceCurrency,
    setContent,
    hasAccess,
    markContentAsPurchased,
  } = usePaymentStore();

  const isPurchased = hasAccess('video', video.id, user?.id?.toString());

  const priceValue = useMemo<number | undefined>(() => {
    const raw = (video as unknown as { price?: unknown }).price;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
      const n = Number(raw);
      if (!Number.isNaN(n)) return n;
      const parsed = parseFloat(raw.replace(/[^0-9.]/g, ''));
      if (!Number.isNaN(parsed)) return parsed;
    }
    if (typeof priceLabel === 'string') {
      const text = priceLabel.toLowerCase();
      if (text.includes('free')) return 0;
      const parsed = parseFloat(priceLabel.replace(/[^0-9.]/g, ''));
      if (!Number.isNaN(parsed)) return parsed;
    }
    return undefined;
  }, [video, priceLabel]);

  const currencyGuess = useMemo<string | undefined>(() => {
    if (typeof priceLabel !== 'string') return undefined;
    if (priceLabel.includes('₦')) return 'NGN';
    if (priceLabel.includes('$')) return 'USD';
    if (priceLabel.includes('€')) return 'EUR';
    if (priceLabel.includes('£')) return 'GBP';
    return undefined;
  }, [priceLabel]);

  const formatPriceWithCurrency = useCallback((price: number, currency?: string) => {
    if (price === 0) return 'Free';
    
    switch (currency) {
      case 'NGN':
        return `₦${price.toFixed(2)}`;
      case 'USD':
        return `$${price.toFixed(2)}`;
      case 'EUR':
        return `€${price.toFixed(2)}`;
      case 'GBP':
        return `£${price.toFixed(2)}`;
      default:
        return `₦${price.toFixed(2)}`; // Default to NGN
    }
  }, []);

  const navigateToVideo = useCallback(() => {
    router.push(`/dashboard/video/${video.id}`);
  }, [router, video.id]);

  const onCardClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isChecking || isInitializing || isVerifying) return;
    
    // Check if current user is the creator/owner
    if (user && video.userId && (String(user.id) === String(video.userId))) {
      navigateToVideo();
      return;
    }
    
    if (priceValue !== undefined && priceValue <= 0) {
      navigateToVideo();
      return;
    }
    setError(undefined);
    setIsChecking(true);
    try {
      const res = await checkAccess('video', video.id);
      const result: CheckAccessResponseExtended = res;
      const isFreeServer = (result.isFree === true) || (Number(result.price) === 0);
      if (isFreeServer || result.hasAccess) {
        // Sync store if access granted
        markContentAsPurchased('video', video.id, user?.id?.toString());
        navigateToVideo();
        return;
      }
      const priceToShow = result.price ?? (priceValue !== undefined ? String(priceValue) : undefined);
      const currencyToShow = result.currency ?? currencyGuess;
      setPriceCurrency(priceToShow, currencyToShow);
      setContent('video', video.id);
      openModal();
    } catch {
      if (priceValue !== undefined && priceValue <= 0) {
        navigateToVideo();
      } else {
        setError('Unable to check access. Please try again.');
        setPriceCurrency(priceValue !== undefined ? String(priceValue) : undefined, currencyGuess);
        setContent('video', video.id);
        openModal();
      }
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, isInitializing, isVerifying, user, video.id, video.userId, navigateToVideo, priceValue, currencyGuess, setError, setIsChecking, setPriceCurrency, setContent, openModal, markContentAsPurchased]);

  const displayLabel = useMemo(() => {
    if (isPurchased) return "Paid";
    
    // If we have a price value and currency from the video object, use that
    if (priceValue !== undefined && video.currency) {
      return formatPriceWithCurrency(priceValue, video.currency as string);
    }
    
    // Otherwise fall back to the priceLabel prop
    return priceLabel;
  }, [isPurchased, priceValue, video.currency, formatPriceWithCurrency, priceLabel]); 

  return (
    <>
    <Link 
      href={`/dashboard/video/${video.id}`}
      onClick={onCardClick}
      className={`${base} ${variantCls} ${className}`}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden">
        {/* ... image ... */}
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
              <path d="M0 0V18L14 9L0 0Z" fill="white" />
            </svg>
          </div>
        </div>
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(e);
          }}
          className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
          title="Delete Video"
        >
          <TrashIcon className="w-4 h-4 text-white" />
        </button>
      )}
      {/* Price Badge */}
      {showPrice && (
        <div className="absolute top-3 right-3">
          <Badge variant={isPurchased ? "success" : "price"}>{displayLabel}</Badge>
        </div>
      )}
      {isChecking && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-small text-[#eaeaea]">Checking access…</span>
          </div>
        </div>
      )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        {/* Author and Live Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {video.isLive && (
              <Badge variant="live" className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-accent-red" />
                <span>Live</span>
              </Badge>
            )}
            <span className="text-muted-small truncate">{video.author}</span>
          </div>
          <Avatar src={video.authorAvatar} alt={video.author} size="md" />
        </div>

        {/* Title and Description */}
        <div className="flex flex-col gap-2">
          <h3 className="text-medium line-clamp-1">{video.title}</h3>
          <p className="text-description line-clamp-2">{video.description}</p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-muted-small">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-6 h-6" />
              <span>{formatDuration(video.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                width="17"
                height="18"
                viewBox="0 0 17 18"
                fill="none"
                className="w-4 h-4.5"
              >
                <path
                  d="M8.5 0L0 8.5L8.5 17V11H17V6H8.5V0Z"
                  fill="#888C94"
                />
              </svg>
              <span>{formatTimeAgo(video.postedDate)}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarFilledIcon className="w-5 h-5" />
            <span className="text-muted-small">
              {formatRating(video.rating, video.ratingCount)}
            </span>
          </div>
        </div>
      </div>
    </Link>
    <PaymentModal />
    </>
  );
}
