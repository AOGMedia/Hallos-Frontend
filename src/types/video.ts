// Video detail types for video details page
export interface VideoDetail {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl?: string;
  author: string;
  authorAvatar: string;
  authorBio?: string;
  duration: number;
  postedDate: Date;
  rating: number;
  ratingCount: number;
  category?: string;
  tags?: string[];
  price?: number;
  currency?: string;
  isLive?: boolean;
  classStartDate?: Date;
  viewsCount?: number;
  userId?: string | number; // Creator/owner ID for access control
}

// Props for video components
export interface VideoPlayerProps {
  videoUrl?: string;
  thumbnail: string;
  title: string;
}

export interface VideoMetadataProps {
  duration: number;
  postedDate: Date;
  rating: number;
  ratingCount: number;
}

export interface InstructorInfoProps {
  name: string;
  avatar: string;
  bio?: string;
}

export interface CountdownTimerProps {
  targetDate: Date;
}