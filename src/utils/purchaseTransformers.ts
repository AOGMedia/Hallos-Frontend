import { PurchaseRecord } from '@/lib/api/payments';

export interface PurchaseDisplayItem {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  avatar: string;
  price: number;
  duration: string;
  posted: string;
  rating: number;
  reviews: string;
  isLive: boolean;
  isLiveSeries: boolean;
  href?: string;
  
  // Purchase-specific fields
  isPurchased: true;
  purchaseDate: string;
  paymentStatus: 'completed' | 'pending' | 'failed';
  purchaseAmount: string;
  currency: string;
}

/**
 * Transforms a PurchaseRecord from the API into CourseCard-compatible props
 */
export function transformPurchaseToCardProps(purchase: PurchaseRecord): PurchaseDisplayItem {
  // Format purchase date
  const purchaseDate = purchase.createdAt 
    ? new Date(purchase.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Unknown date';

  // Provide fallback values for missing content data
  const content = purchase.content;
  const title = content?.title || `${purchase.contentType} Content`;
  const thumbnail = content?.thumbnailUrl || '/images/video-placeholder.svg';
  
  // Determine if content is live based on content type
  const isLive = purchase.contentType === 'live_class' || purchase.contentType === 'live';
  const isLiveSeries = purchase.contentType === 'live_series';
  
  // Generate proper href based on content type
  let href = '#';
  if (isLiveSeries && content?.id) {
    // For live series, link to series page
    href = `/series/${content.id}`;
  } else if (isLive && content?.id) {
    // For live classes, link to join page
    href = `/live/join/${content.id}`;
  } else if (content?.id) {
    // For videos, link to video page
    href = `/dashboard/video/${content.id}`;
  }
  
  // Provide default instructor name
  const instructor = 'Instructor'; // Could be enhanced with actual instructor data
  
  // Provide default avatar
  const avatar = '/avatars/alex-chapman.jpg';
  
  // Provide default metadata
  const duration = isLive ? 'Live Session' : '1h 30m';
  const rating = 4.5; // Default rating
  const reviews = '0'; // Default reviews count
  
  return {
    id: purchase.id, // Use purchase ID as the unique identifier
    title,
    description: `Purchased ${purchase.contentType} content`,
    instructor,
    thumbnail,
    avatar,
    price: parseFloat(purchase.amount),
    duration,
    posted: purchaseDate,
    rating,
    reviews,
    isLive,
    isLiveSeries,
    href,
    
    // Purchase-specific data
    isPurchased: true,
    purchaseDate,
    paymentStatus: purchase.paymentStatus as 'completed' | 'pending' | 'failed',
    purchaseAmount: purchase.amount,
    currency: purchase.currency || 'USD', // Use actual currency from purchase, fallback to USD
  };
}

/**
 * Groups purchases by content type for better organization
 */
export function groupPurchasesByType(purchases: PurchaseDisplayItem[]): {
  videos: PurchaseDisplayItem[];
  live: PurchaseDisplayItem[];
  series: PurchaseDisplayItem[];
} {
  return purchases.reduce(
    (groups, purchase) => {
      if (purchase.isLiveSeries) {
        groups.series.push(purchase);
      } else if (purchase.isLive) {
        groups.live.push(purchase);
      } else {
        groups.videos.push(purchase);
      }
      return groups;
    },
    { videos: [] as PurchaseDisplayItem[], live: [] as PurchaseDisplayItem[], series: [] as PurchaseDisplayItem[] }
  );
}

/**
 * Formats payment status for display
 */
export function formatPaymentStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
}