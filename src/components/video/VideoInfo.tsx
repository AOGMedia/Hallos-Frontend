'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { ReportButton } from '@/components/report/ReportButton';
import { shareUrl } from '@/lib/video/playerUtils';
import { formatTimeAgo } from '@/utils/formatters';
import { formatCurrency } from '@/utils/formatters';
import { VideoShareModal } from './VideoShareModal';
import type { VideoDetail } from '@/types/video';

const compact = (n: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

/** Title, views and date, the creator, and Share / Report: under the player, like YouTube. */
export function VideoInfo({ video, isOwner }: { video: VideoDetail; isOwner: boolean }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const views = video.viewsCount ?? 0;
  const paid = Number(video.price) > 0;

  const share = async () => {
    const result = await shareUrl(window.location.href, video.title);
    if (result === 'copied') { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    if (result === 'fallback' || result === 'copied') setShareOpen(true);
  };
  const copy = async () => {
    if ((await shareUrl(window.location.href)) !== 'fallback') { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-lg font-bold leading-snug text-text-primary md:text-xl">{video.title}</h1>
      <p className="text-sm text-text-muted">
        {compact(views)} {views === 1 ? 'view' : 'views'} · {formatTimeAgo(video.postedDate)}
        {paid && video.currency ? ` · ${formatCurrency(String(video.price), video.currency)}` : ''}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar src={video.authorAvatar} alt={video.author} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-text-primary">{video.author}</p>
            {isOwner && <p className="text-xs text-text-muted">Your video</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void share()}
            className="flex h-10 items-center gap-2 rounded-full bg-white/[0.08] px-4 text-sm font-semibold text-text-primary transition hover:bg-white/[0.14] active:scale-95"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
            {copied ? 'Copied' : 'Share'}
          </button>
          {!isOwner && <ReportButton targetType="video" targetId={video.id} subject="this video" />}
        </div>
      </div>

      <VideoShareModal isOpen={shareOpen} copied={copied} onClose={() => setShareOpen(false)} onCopy={() => void copy()} />
    </section>
  );
}
