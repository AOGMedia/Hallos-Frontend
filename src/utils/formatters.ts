// Format view count
export const formatViewCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}k`;
  }
  return count.toString();
};

// Format time ago
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'today';
  if (diffInDays === 1) return '1d ago';
  return `${diffInDays}d ago`;
};

// Format duration
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  return `${Math.floor(seconds / 3600)} hr`;
};

// Format rating
export const formatRating = (rating: number, count: number): string => {
  const formattedCount = count >= 1000 ? `${(count / 1000).toFixed(0)}k` : count;
  return `${rating.toFixed(1)}  (${formattedCount})`;
};

// Format call duration in MM:SS format
export const formatCallDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format currency value by code
export const formatCurrency = (amount: number | string, currency: string): string => {
  const numeric = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
  const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
  const formatted = Number.isFinite(numeric) ? numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount.toString();
  return `${symbol} ${formatted}`;
};

// Format date string (YYYY-MM-DD) -> DD Mon, YYYY
export const formatDateLabel = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString(undefined, { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
};

// Format time string (HH:MM) -> h:mm AM/PM
export const formatTimeLabel = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
};