'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUploadProgress } from '@/hooks/useVideoUpload';
import type { UploadState } from './uploadEngine';
import { formatFileSize, formatProgress, formatSpeed, formatTimeLeft } from '@/utils/videoUploadFormatters';

/**
 * The wording for the upload in progress, in one place so the step-1 panel,
 * the strip on the other steps and the dashboard pill always agree.
 */
export function uploadStatusText(s: UploadState): { heading: string; detail: string; tone: 'normal' | 'warning' | 'error' } {
  switch (s.phase) {
    case 'starting':
      return { heading: 'Uploading a file', detail: 'Getting ready…', tone: 'normal' };
    case 'waiting':
      return { heading: 'Ready to upload', detail: 'Your video uploads when you publish.', tone: 'normal' };
    case 'done':
      return {
        heading: 'Upload complete',
        detail: s.published ? 'Your video is being prepared and will appear shortly.' : `${formatFileSize(s.size)} uploaded`,
        tone: 'normal',
      };
    case 'failed':
      return { heading: 'Upload stopped', detail: s.error || 'Please try again.', tone: 'error' };
    case 'uploading': {
      if (s.offline) {
        return { heading: 'Upload paused', detail: 'No connection. It carries on by itself when you’re back online.', tone: 'warning' };
      }
      if (s.loaded <= 0) return { heading: 'Uploading a file', detail: `Starting upload of ${formatFileSize(s.size)}…`, tone: 'normal' };
      const sent = `${formatFileSize(s.loaded)} of ${formatFileSize(s.size)}`;
      if (s.stalled) return { heading: 'Uploading a file', detail: `${sent} · Slow connection, still uploading…`, tone: 'warning' };
      const parts = [sent, formatSpeed(s.speed), formatTimeLeft(s.secondsLeft)].filter(Boolean);
      return { heading: 'Uploading a file', detail: parts.join(' · '), tone: 'normal' };
    }
    default:
      return { heading: '', detail: '', tone: 'normal' };
  }
}

const TONE_TEXT = { normal: 'text-text-secondary', warning: 'text-[#F5B83D]', error: 'text-accent-red' } as const;

/** The same thin green bar as the existing upload progress. */
export function UploadBar({ percent }: { percent: number }) {
  return (
    <div
      className="w-full h-1 bg-background-dark rounded-full overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
    >
      <div className="h-full bg-[#00FF40] transition-all duration-300" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function UploadDetail({ state }: { state: UploadState }) {
  const { detail, tone } = uploadStatusText(state);
  if (!detail) return null;
  return (
    <p className={`text-xs ${TONE_TEXT[tone]}`} aria-live="polite">
      {detail}
    </p>
  );
}

/**
 * On the Details, Elements and Visibility steps: the upload keeps going while
 * the creator fills in the form. Hidden when there's nothing uploading.
 */
export function UploadStatusStrip() {
  const upload = useUploadProgress();
  if (upload.phase === 'idle') return null;
  const { heading } = uploadStatusText(upload);
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-primary/[0.06] px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-text-primary truncate">
          {heading} · {upload.fileName}
        </p>
        {upload.phase === 'uploading' && (
          <span className="text-xs text-[#00FF40] shrink-0">{formatProgress(upload.percent)}</span>
        )}
      </div>
      {upload.phase !== 'waiting' && <UploadBar percent={upload.percent} />}
      <UploadDetail state={upload} />
    </div>
  );
}

/**
 * Anywhere else on the dashboard: the upload carries on, and this pill says
 * how it's going. Tapping it goes back to the upload.
 */
export function UploadStatusPill() {
  const upload = useUploadProgress();
  const pathname = usePathname();
  const active = upload.phase === 'starting' || upload.phase === 'uploading' || upload.phase === 'failed';
  if (!active || pathname === '/dashboard/create') return null;

  const { tone } = uploadStatusText(upload);
  const label =
    upload.phase === 'failed'
      ? 'Upload stopped'
      : upload.offline
        ? 'Upload paused'
        : upload.published
          ? `Publishing ${formatProgress(upload.percent)}`
          : `Uploading ${formatProgress(upload.percent)}`;

  return (
    <Link
      href="/dashboard/create"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 max-w-[calc(100vw-2rem)] bg-[#1F2636] text-[#F2F2F2] pl-4 pr-5 py-2.5 rounded-full border border-[rgba(234,234,234,0.08)] shadow-lg"
      aria-live="polite"
    >
      <span className="relative h-1 w-14 shrink-0 rounded-full bg-background-dark overflow-hidden" aria-hidden>
        <span
          className={`absolute inset-y-0 left-0 rounded-full ${tone === 'error' ? 'bg-accent-red' : tone === 'warning' ? 'bg-[#F5B83D]' : 'bg-[#00FF40]'}`}
          style={{ width: `${upload.percent}%` }}
        />
      </span>
      <span className="text-sm font-medium shrink-0">{label}</span>
      <span className="text-xs text-text-secondary truncate">{upload.fileName}</span>
    </Link>
  );
}
