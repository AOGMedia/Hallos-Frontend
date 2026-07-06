import { VideoChapter } from './types';

export const MOCK_VIDEO_CHAPTERS: VideoChapter[] = [
  {
    id: 'chapter-1',
    title: 'The Vision',
    description: 'An inspiring keynote that sets the stage for everything we are building together.',
    duration: 45,
    videoSrc: 'https://res.cloudinary.com/dblsgkbk4/video/upload/v1781269264/compressed_dklgv9.mp4',
    posterSrc: 'https://res.cloudinary.com/dblsgkbk4/image/upload/v1760131928/2148940744_1_y9chc5.png',
  },
  {
    id: 'chapter-2',
    title: 'Creator Stories',
    description: 'Real attendees share their transformative experiences and breakthrough moments.',
    duration: 52,
    videoSrc: 'https://res.cloudinary.com/dblsgkbk4/video/upload/v1781269264/compressed_dklgv9.mp4',
    posterSrc: 'https://res.cloudinary.com/dblsgkbk4/image/upload/v1760131928/2148940744_1_y9chc5.png',
  },
  {
    id: 'chapter-3',
    title: 'Skills Workshop',
    description: 'A hands-on deep dive into the tools and techniques that drive creative success.',
    duration: 38,
    videoSrc: 'https://res.cloudinary.com/dblsgkbk4/video/upload/v1781269264/compressed_dklgv9.mp4',
    posterSrc: 'https://res.cloudinary.com/dblsgkbk4/image/upload/v1760131928/2148940744_1_y9chc5.png',
  },
  {
    id: 'chapter-4',
    title: 'The Community',
    description: 'Networking, collaboration, and the closing moments that connect us all.',
    duration: 35,
    videoSrc: 'https://res.cloudinary.com/dblsgkbk4/video/upload/v1781269264/compressed_dklgv9.mp4',
    posterSrc: 'https://res.cloudinary.com/dblsgkbk4/image/upload/v1760131928/2148940744_1_y9chc5.png',
  },
];

export const VIDEO_CONFIG = {
  intersection: {
    thresholds: [0, 0.25, 0.5, 0.75, 1] as number[],
    playThreshold: 0.5,
    pauseThreshold: 0.25,
  },
  preload: {
    active: 'auto' as const,
    inactive: 'metadata' as const,
  },
  playback: {
    volumeStep: 0.1,
    skipStep: 10,
    autoAdvanceDelay: 1500,
    timeupdateThrottle: 250,
    controlsHideDelay: 3000,
  },
  keyboard: {
    togglePlay: ['Space', 'k'],
    skipBackward: ['ArrowLeft'],
    skipForward: ['ArrowRight'],
    volumeUp: ['ArrowUp'],
    volumeDown: ['ArrowDown'],
    toggleMute: ['m'],
    toggleFullscreen: ['f'],
    prevChapter: ['j'],
    nextChapter: ['l'],
  },
};
