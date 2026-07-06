# Cinematic Event Journey — Implementation Spec

## Context
- Project: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4
- Event page: `src/components/event/EventLandingPage.tsx`
- Available deps: `framer-motion`, `lucide-react`, `hls.js`, `clsx`, `tailwind-merge`
- Design system tokens are defined in `src/app/styles/variables.css`, `src/app/styles/typography.css`, `src/app/styles/components.css`
- Existing utilities: `glass-effect`, `video-card`, `event-section-dark`, `heading-section`, `text-body`, etc.
- Section placement: **immediately after** `<EventLandingHero />` in `EventLandingPage.tsx`

## Chunk Breakdown

### Chunk 1: Types, Constants, and Utility Hooks
**Files (5):**
1. `src/components/event/video-journey/types.ts`
2. `src/components/event/video-journey/constants.ts`
3. `src/components/event/video-journey/useIntersectionPlayback.ts`
4. `src/components/event/video-journey/useVideoPlayback.ts`
5. `src/components/event/video-journey/useKeyboardNavigation.ts`

**Complexity:** `complex` (concurrency via IntersectionObserver + video lifecycle + autoplay restrictions)

**Spec details:**

#### types.ts
```ts
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
  type: 'video_started' | 'video_completed' | 'chapter_changed' | 'sound_enabled' | 'fullscreen_entered' | 'engagement_duration';
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
```

#### constants.ts
- `MOCK_VIDEO_CHAPTERS: VideoChapter[]` with 4 realistic chapters:
  1. "The Vision" - keynote opening
  2. "Creator Stories" - attendee testimonials
  3. "Skills Workshop" - hands-on session
  4. "The Community" - networking & closing
- Each with poster images from `/images/event/`, video src placeholders, duration ~30-60s
- `VIDEO_CONFIG` object with thresholds, preload settings, keyboard key maps

#### useIntersectionPlayback.ts
- Returns `{ ref, isVisible, isSufficientlyVisible }`
- Uses `IntersectionObserver` with `threshold: [0, 0.25, 0.5, 0.75, 1]`
- `isSufficientlyVisible` true when >= 50% visible
- Trigger: auto-play when sufficiently visible, pause when < 25% visible
- Cleanup observer on unmount
- Use `useRef` for the observer to avoid re-creation

#### useVideoPlayback.ts
- **State (all in a single reducer logic to avoid stale closures):**
  - `isPlaying, isMuted, volume (0-1), currentTime, duration, isFullscreen, isBuffering, isEnded`
- **Callbacks (useCallback, memoized):**
  - `play()`, `pause()`, `togglePlay()`, `toggleMute()`, `setVolume(v)`, `seek(t)`, `skip(seconds)`, `goToChapter(index)`, `toggleFullscreen()`, `handleEnded()`
- **Video lifecycle (useEffect):**
  - Attach `loadedmetadata` → set duration
  - Attach `timeupdate` → throttle to 250ms via ref, update currentTime
  - Attach `waiting` → isBuffering = true
  - Attach `playing` → isBuffering = false
  - Attach `ended` → isEnded = true, auto-advance to next chapter
  - Attach `error` → pause, log
  - Cleanup all listeners on unmount / src change
- **Autoplay behavior:**
  - On `isSufficientlyVisible` change: if true and not ended → `play()`
  - Play attempts should first try unmuted, catch `NotAllowedError`, then retry muted
- **Chapter auto-advance:**
  - On `ended` event, after 1.5s delay, advance to next chapter index (if exists)
- **Fullscreen:**
  - Use `videoElement.requestFullscreen()` / `document.exitFullscreen()`
  - Listen for `fullscreenchange` on document to sync state
- Return consolidated state object and all callbacks

#### useKeyboardNavigation.ts
- Attaches `keydown` listener to `document` when section is focused/visible
- Keys:
  - `Space` / `k` → togglePlay
  - `ArrowLeft` → skip(-10)
  - `ArrowRight` → skip(10)
  - `ArrowUp` → setVolume(min(1, volume + 0.1))
  - `ArrowDown` → setVolume(max(0, volume - 0.1))
  - `m` → toggleMute
  - `f` → toggleFullscreen
  - `j` → previous chapter
  - `l` → next chapter
- Prevent default on handled keys to avoid page scroll
- Only active when `isVisible` from intersection hook
- Cleanup on unmount / disable change

---

### Chunk 2: UI Components (Part 1 — Player Shell & Controls)
**Files (4):**
1. `src/components/event/video-journey/ProgressBar.tsx`
2. `src/components/event/video-journey/SoundControl.tsx`
3. `src/components/event/video-journey/VideoControls.tsx`
4. `src/components/event/video-journey/VideoPlayer.tsx`

**Complexity:** `simple` (presentational, but needs accessibility care)

**Spec details:**

#### ProgressBar.tsx
- Props: `currentTime, duration, onSeek, buffered?`
- Visual: track height 4px, rounded-full
  - Track bg: `rgba(242,242,242,0.15)`
  - Filled bg: `linear-gradient(90deg, #6a57e5, #5099f8)`
- Interaction:
  - Click to seek
  - Drag to scrub (mousedown + mousemove + mouseup on window)
  - Touch support (touchstart + touchmove + touchend)
- Accessibility:
  - `role="slider"`, `aria-valuemin={0}`, `aria-valuemax={duration}`, `aria-valuenow={currentTime}`, `aria-label="Seek video"`
  - Focus ring on keyboard focus
- Time tooltip on hover/drag showing seek target time (formatted mm:ss)
- Memoized to avoid re-renders on every timeupdate

#### SoundControl.tsx
- Props: `volume, isMuted, onVolumeChange, onMuteToggle`
- Visual:
  - Speaker icon from lucide: `VolumeX` (muted), `Volume1` (low), `Volume2` (high)
  - Inline volume slider appears on hover/focus of the icon group
  - Slider: vertical on desktop (popover), horizontal on mobile
  - Track bg `rgba(242,242,242,0.15)`, fill `#6a57e5`
- Accessibility:
  - `aria-label={isMuted ? "Unmute" : "Mute"}` on mute button
  - Volume slider `aria-label="Volume"`, `aria-valuemin={0}`, `aria-valuemax={100}`

#### VideoControls.tsx
- Props: `playbackState, callbacks, chapterIndex, totalChapters`
- Layout: absolute positioned overlay at bottom of video, `glass-effect` background, rounded-2xl (desktop), full-width (mobile)
- Left cluster: Play/Pause button, SkipBack10, SkipForward10
- Center: ProgressBar (full width between clusters)
- Right cluster: Previous Chapter, Next Chapter, SoundControl, Fullscreen button
- All buttons: icon-only, `text-primary` color, hover state `opacity-80`, focus ring
- Icons from lucide-react:
  - Play: `Play`
  - Pause: `Pause`
  - SkipBack10: custom SVG or `RotateCcw` with "10" label
  - SkipForward10: custom SVG or `RotateCw` with "10" label
  - Prev: `ChevronLeft` or `SkipBack`
  - Next: `ChevronRight` or `SkipForward`
  - Fullscreen: `Maximize` / `Minimize`
- Show chapter counter: "1 / 4" as text-muted-small between prev/next
- Auto-hide behavior: controls visible on hover/touch. After 3s of inactivity, fade out (opacity transition 300ms). Moving mouse or touching reveals. Use `onMouseMove`, `onTouchStart` with `setTimeout` ref cleanup.
- Reduced motion: if `prefers-reduced-motion`, disable auto-hide transitions (instant)

#### VideoPlayer.tsx
- Props: `chapter, isActive, autoPlay, onEnded, onTimeUpdate, onToggleFullscreen?`
- Renders `<video>` element
- Video attributes:
  - `playsInline` (required for iOS)
  - `muted={true}` (initial — browser autoplay requirement)
  - `preload={isActive ? "auto" : "metadata"}`
  - `poster={chapter.posterSrc}`
  - `src={chapter.videoSrc}` (MP4 fallback)
- HLS support:
  - If `chapter.hlsSrc` exists and `hls.js` `isSupported()`, instantiate Hls, attach to video
  - Load source only when `isActive` becomes true
  - Destroy Hls instance on unmount / chapter change
- Visual wrapper: `video-card` or `event-about-card-dark` utility for outer container? Actually the video container should be cinematic — full rounded-2xl (24px), overflow-hidden, aspect-ratio cinematic like `aspect-video` or `aspect-[21/9]` for premium feel. Let's use `aspect-video` for compatibility but with max-height constraints.
- Big centered play overlay when paused: `glass-effect` circle with Play icon, fades out on play via framer-motion `AnimatePresence`
- Buffering spinner: simple CSS rotating border when `isBuffering`
- Transition between chapters: crossfade using framer-motion. When chapter changes, outgoing video fades out (opacity 0, 300ms), incoming fades in (opacity 1, 300ms). Use `key={chapter.id}` on motion wrapper.

---

### Chunk 3: UI Components (Part 2 — Chapter Timeline & Main Section)
**Files (4):**
1. `src/components/event/video-journey/ChapterItem.tsx`
2. `src/components/event/video-journey/ChapterTimeline.tsx`
3. `src/components/event/video-journey/EventVideoJourney.tsx`
4. `src/components/event/video-journey/index.ts`

**Complexity:** `simple` (presentational + integration)

**Spec details:**

#### ChapterItem.tsx
- Props: `chapter, index, isActive, isCompleted, onClick`
- Visual:
  - Horizontal layout: thumbnail (left), text content (right)
  - Thumbnail: poster image, `aspect-video`, rounded-xl (16px), object-cover
  - Active state: border-2 border-primary (`#6a57e5`), subtle glow `shadow-[0_0_20px_rgba(106,87,229,0.3)]`
  - Completed state: small checkmark overlay on thumbnail (bottom-right), `bg-primary` circle with `Check` icon
  - Inactive: border `rgba(234,234,234,0.1)`, opacity lower
  - Title: `text-regular` / `text-primary`
  - Description: `text-description`
  - Duration: `text-small` text-gray
- Hover: scale(1.02) transition, border brighten
- Click: triggers `onClick(index)`
- Accessibility: `role="button"`, `tabIndex={0}`, `aria-pressed={isActive}`, `aria-label="Play chapter ${index + 1}: ${chapter.title}"`
- Keyboard: Enter/Space triggers onClick

#### ChapterTimeline.tsx
- Props: `chapters, activeIndex, completedIndices, onChapterSelect`
- Visual: vertical list on desktop (right column of 2-col layout), horizontal scrollable on mobile
- Container: `glass-effect`, rounded-2xl, padding 24px
- Header: "Chapters" with `heading-small` + chapter count `text-small` text-gray
- Spacing: gap-4 between items
- Auto-scroll active item into view on mobile (smooth scroll)
- Reduced motion: disable scroll animations

#### EventVideoJourney.tsx
- Main section component
- Props: `VideoJourneyProps`
- State managed via `useVideoPlayback` and `useIntersectionPlayback`
- Layout (desktop): 2-column grid — left 65% video player, right 35% chapter timeline
  - `grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8`
- Layout (mobile): stacked — video on top, timeline below
- Section wrapper:
  - `bg-black w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-16` (same as EventWhyJoinSection)
  - `max-w-[1440px] mx-auto`
  - Section heading: same style as EventAboutSection heading but "Event Journey"
    - `heading-section` utility, text `#f2f2f2`
  - Subtitle: "Experience the highlights" — `text-body`
- Video area: wrapped with `useIntersectionPlayback` ref
- Keyboard nav: `useKeyboardNavigation`
- Controls overlay: rendered inside video area
- Chapter timeline: renders alongside
- Loading state: if no chapters, show `video-card` skeleton shimmer (use existing `animate-shimmer`)
- Mobile: user can swipe on video area to go prev/next chapter (touchstart/touchend with horizontal delta > 50px)
- Section `aria-label="Event video journey"`
- `id="event-journey"` for potential anchor links

#### index.ts
- Barrel exports for all video-journey components
- Export types

---

### Chunk 4: Integration & Mock Data Update
**Files (2):**
1. `src/components/event/EventLandingPage.tsx` — render `<EventVideoJourney />`
2. `src/components/event/index.ts` — export `EventVideoJourney`

**Complexity:** `simple`

**Spec details:**

#### EventLandingPage.tsx
Insert immediately after `<EventLandingHero />`:
```tsx
<EventVideoJourney
  chapters={MOCK_VIDEO_CHAPTERS}
  sectionTitle="Event Journey"
  sectionSubtitle="Relive every moment, from keynote to closing."
/>
```
- No changes to other sections' order

#### index.ts
- Add `export { EventVideoJourney } from './EventVideoJourney';` or via barrel

---

## Design Token Mapping

| Element | Token / Value |
|---|---|
| Section bg | `bg-black` |
| Container max-width | `max-w-[1440px] mx-auto` |
| Video container | `video-card` OR `rounded-2xl overflow-hidden border border-border` |
| Chapter list container | `glass-effect` + `rounded-2xl` |
| Controls bg | `glass-effect` |
| Primary accent | `#6a57e5` (primary) |
| Secondary accent | `#5099f8` |
| Text primary | `#f2f2f2` |
| Text muted | `rgba(242,242,242,0.8)` |
| Text gray | `#888c94` |
| Border | `rgba(234,234,234,0.1)` |
| Progress fill | `linear-gradient(90deg, #6a57e5, #5099f8)` |
| Typography headings | `heading-section`, `heading-small`, `text-regular` |
| Body text | `text-body`, `text-description` |
| Motion | `framer-motion` for transitions, opacity + translateY, 300ms duration |
| Reduced motion | `prefers-reduced-motion` → disable transitions, instant state changes |

## Accessibility Checklist
- [ ] All controls have `aria-label`
- [ ] Progress bar is `role="slider"` with proper aria values
- [ ] Chapter items are keyboard accessible (Enter/Space)
- [ ] Keyboard shortcuts documented via `aria-keyshortcuts` on section
- [ ] Focus trap within controls when open (not needed for inline)
- [ ] `prefers-reduced-motion` respected globally
- [ ] Color contrast ratios met (light text on dark bg)
- [ ] Screen reader announces chapter changes via `aria-live="polite"` region
- [ ] Video has `aria-label` describing current chapter

## Performance Checklist
- [ ] Only active video loads with `preload="auto"`; others `preload="metadata"`
- [ ] Hls.js only instantiated for active chapter with HLS source
- [ ] Video element cleaned up (src="", load()) on chapter change to stop downloads
- [ ] IntersectionObserver paused disconnected when section hidden
- [ ] All callbacks use `useCallback`
- [ ] Components wrapped in `React.memo` where beneficial
- [ ] No inline arrow functions in render (except stable callbacks)
- [ ] Timeupdate throttled to 250ms via ref
- [ ] Lazy load entire section? Not needed since it's above fold-ish, but consider `next/dynamic` if bundle heavy. Since we don't add heavy libs, inline is fine.

## Acceptance Criteria
1. `EventVideoJourney` renders after `EventLandingHero` on `/dashboard/events`
2. IntersectionObserver auto-plays video when 50%+ visible, pauses when <25% visible
3. Muted autoplay works; attempting unmuted falls back to muted on block
4. Custom controls (play, pause, mute, volume, progress, fullscreen, skip ±10s, prev/next chapter) all functional
5. Chapter auto-advances on video end with 1.5s delay
6. Keyboard navigation works for all bound keys
7. Mobile: touch-friendly controls, horizontal swipe changes chapters
8. Progress bar is accessible with aria attributes
9. HLS.js loads HLS sources when available
10. No TypeScript errors, no ESLint errors
11. Section uses existing design tokens (no arbitrary colors/fonts)
