/**
 * Recording settings for GetStream classes — the choices offered to the
 * creator, mirroring the backend (services/recordingSettingsService.js),
 * which validates every value again. Saved per creator; they apply to the
 * next recording they start (or auto-recording from the next class).
 */

export type RecordingFormat = "video" | "audio";
export type RecordingQuality = "360p" | "480p" | "720p" | "1080p";
export type RecordingOrientation = "landscape" | "portrait";
export type RecordingLayout = "spotlight" | "grid" | "single-participant";
export type SpotlightBar = "bottom" | "top" | "left" | "right";
export type GridSize = 4 | 9 | 16 | 20;
export type SpeakerMode = "presenter" | "rotate";
export type RecordingBackground = "midnight" | "slate" | "brand" | "black";
export type VideoFit = "fill" | "fit";

export interface RecordingSettings {
  format: RecordingFormat;
  quality: RecordingQuality;
  orientation: RecordingOrientation;
  layout: RecordingLayout;
  spotlightBar: SpotlightBar;
  gridSize: GridSize;
  gridFill: boolean;
  speakerMode: SpeakerMode;
  showLogo: boolean;
  showTitle: boolean;
  showNames: boolean;
  background: RecordingBackground;
  videoFit: VideoFit;
  autoRecord: boolean;
}

/** The standard settings: what every recording used before settings existed. */
export const DEFAULT_RECORDING_SETTINGS: RecordingSettings = {
  format: "video",
  quality: "720p",
  orientation: "landscape",
  layout: "spotlight",
  spotlightBar: "bottom",
  gridSize: 20,
  gridFill: false,
  speakerMode: "presenter",
  showLogo: true,
  showTitle: false,
  showNames: true,
  background: "midnight",
  videoFit: "fill",
  autoRecord: false,
};

export interface Option<T> {
  value: T;
  label: string;
  hint?: string;
}

export const QUALITY_OPTIONS: Option<RecordingQuality>[] = [
  { value: "360p", label: "360p", hint: "Smallest files" },
  { value: "480p", label: "480p", hint: "Data saver" },
  { value: "720p", label: "720p HD", hint: "Recommended" },
  { value: "1080p", label: "1080p Full HD", hint: "Sharpest" },
];

export const ORIENTATION_OPTIONS: Option<RecordingOrientation>[] = [
  { value: "landscape", label: "Landscape", hint: "For laptops and TVs" },
  { value: "portrait", label: "Portrait", hint: "For phones and reels" },
];

export const LAYOUT_OPTIONS: Option<RecordingLayout>[] = [
  { value: "spotlight", label: "Spotlight", hint: "The speaker large, others alongside" },
  { value: "grid", label: "Grid", hint: "Everyone the same size" },
  { value: "single-participant", label: "Single speaker", hint: "One person at a time" },
];

export const SPOTLIGHT_BAR_OPTIONS: Option<SpotlightBar>[] = [
  { value: "bottom", label: "Bottom" },
  { value: "top", label: "Top" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

export const GRID_SIZE_OPTIONS: Option<GridSize>[] = [
  { value: 4, label: "4" },
  { value: 9, label: "9" },
  { value: 16, label: "16" },
  { value: 20, label: "20" },
];

export const SPEAKER_MODE_OPTIONS: Option<SpeakerMode>[] = [
  { value: "presenter", label: "Follow the speaker" },
  { value: "rotate", label: "Rotate everyone" },
];

/** Brand backgrounds behind the video (the backend holds the exact colours). */
export const BACKGROUND_OPTIONS: (Option<RecordingBackground> & { swatch: string })[] = [
  { value: "midnight", label: "Midnight", swatch: "#0d0f18" },
  { value: "slate", label: "Slate", swatch: "#1f2636" },
  { value: "brand", label: "Hallos purple", swatch: "#6a57e5" },
  { value: "black", label: "Black", swatch: "#000000" },
];

export const VIDEO_FIT_OPTIONS: Option<VideoFit>[] = [
  { value: "fill", label: "Fill", hint: "Edge to edge" },
  { value: "fit", label: "Fit", hint: "Show the whole picture" },
];

export const sameSettings = (a: RecordingSettings, b: RecordingSettings) =>
  (Object.keys(a) as (keyof RecordingSettings)[]).every((key) => a[key] === b[key]);

/** One line describing the settings, e.g. "720p HD · Spotlight · Landscape". */
export function summarizeRecording(s: RecordingSettings): string {
  if (s.format === "audio") return "Audio only (MP3)";
  const quality = QUALITY_OPTIONS.find((o) => o.value === s.quality)?.label ?? s.quality;
  const layout = LAYOUT_OPTIONS.find((o) => o.value === s.layout)?.label ?? s.layout;
  return `${quality} · ${layout} · ${s.orientation === "portrait" ? "Portrait" : "Landscape"}`;
}
