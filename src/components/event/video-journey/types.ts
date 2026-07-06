export interface VideoChapter {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  videoSrc: string;
  posterSrc: string;
  hlsSrc?: string;
}

export interface VideoJourneyProps {
  chapters: VideoChapter[];
  sectionTitle?: string;
  sectionSubtitle?: string;
  onAnalytics?: (event: VideoAnalyticsEvent) => void;
}

export interface VideoAnalyticsEvent {
  type:
    | 'video_started'
    | 'video_completed'
    | 'chapter_changed'
    | 'sound_enabled'
    | 'fullscreen_entered'
    | 'engagement_duration';
  chapterId?: string;
  chapterIndex?: number;
  duration?: number;
  timestamp: number;
}

export interface PlaybackState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isFullscreen: boolean;
  isBuffering: boolean;
  isEnded: boolean;
}

export type PlaybackActionType =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'MUTE' }
  | { type: 'UNMUTE' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SEEK'; payload: number }
  | { type: 'SKIP'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_BUFFERING'; payload: boolean }
  | { type: 'SET_ENDED'; payload: boolean }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'GO_TO_CHAPTER'; payload: number };
