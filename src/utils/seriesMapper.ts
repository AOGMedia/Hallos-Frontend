import type { Series } from '@/types/series';
import type { LiveSeriesData } from '@/components/dashboard/invite/types';

/**
 * Calculate countdown from now to target date
 * Returns days, hours, minutes, seconds as strings
 */
export function calculateCountdown(targetDate: Date): { days: string; hours: string; minutes: string; seconds: string } {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: '0', hours: '0', minutes: '0', seconds: '0' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days: String(days),
    hours: String(hours),
    minutes: String(minutes),
    seconds: String(seconds)
  };
}

/**
 * Calculate end time given start time and duration in minutes
 * Example: startTime="18:00", duration=120 -> returns "20:00"
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  
  const endHours = String(endDate.getHours()).padStart(2, '0');
  const endMinutes = String(endDate.getMinutes()).padStart(2, '0');
  
  return `${endHours}:${endMinutes}`;
}

/**
 * Convert Series from backend API to LiveSeriesData format for UI components
 * This allows us to reuse the existing LiveSeriesSection component
 */
export function seriesToLiveSeriesData(series: Series): LiveSeriesData {
  // Calculate countdown to next session
  const nextSession = series.stats?.nextSession;
  const countdown = nextSession 
    ? calculateCountdown(new Date(nextSession.scheduledStartTime))
    : { days: '0', hours: '0', minutes: '0', seconds: '0' };

  // Format date (e.g., "February 26, 2026")
  const startDate = new Date(series.startDate);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Format time from recurrence pattern
  const startTime = series.recurrencePattern.startTime; // e.g., "18:00"
  const duration = series.recurrencePattern.duration; // e.g., 120 (minutes)
  const endTime = calculateEndTime(startTime, duration); // e.g., "20:00"

  // Format price (convert from kobo/cents to currency units - already in main currency)
  const priceAmount = series.price 
    ? (typeof series.price === 'number' ? series.price : parseFloat(series.price as string)).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : '0.00';

  // Map to LiveSeriesData format
  return {
    id: series.id,
    className: series.title,
    thumbnail: series.thumbnailUrl || '/images/video-placeholder.svg',
    host: {
      name: series.creator ? `${series.creator.firstname} ${series.creator.lastname}` : 'Unknown',
      avatar: '/avatars/host-avatar.jpg' // Default avatar
    },
    isLive: (series.stats?.liveSessions || 0) > 0, // True if any session is currently live
    title: series.title,
    description: series.description || 'No description available',
    price: {
      amount: priceAmount,
      currency: series.currency || 'NGN'
    },
    pricing: series.pricing, // Include new dual currency pricing if available
    date: formattedDate,
    time: {
      start: startTime,
      end: endTime
    },
    attendeeCount: String(series.stats?.totalSessions || 0) + ' sessions', // Show total sessions instead of attendee count
    countdown
  };
}
