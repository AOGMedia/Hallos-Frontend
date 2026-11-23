"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoInfo } from "@/components/video/VideoInfo";
import { VideoDescription } from "@/components/video/VideoDescription";
import { UpNextList, useUpNext } from "@/components/video/UpNext";
import { VideoPageSkeleton } from "@/components/video/VideoPageSkeleton";
import { Button } from "@/components/ui/Button";
import { getVideoById } from "@/lib/api/videos";
import type { VideoDetail } from "@/types/video";
import { checkAccess } from '@/lib/api/payments';
import { usePaymentStore } from '@/store/paymentStore';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useCurrentUser } from "@/hooks/useCurrentUser";

const THEATER_KEY = "hallos:theater";

export default function VideoDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  const { user } = useCurrentUser(); // Get current user for creator access check

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccessToVideo, setHasAccessToVideo] = useState<boolean>(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState<boolean>(true);
  // Desktop theater mode, remembered like YouTube (wide player, details below).
  const [theater, setTheater] = useState(false);
  useEffect(() => {
    try { setTheater(localStorage.getItem(THEATER_KEY) === "1"); } catch { /* private mode */ }
  }, []);
  const toggleTheater = useCallback(() => {
    setTheater((on) => {
      try { localStorage.setItem(THEATER_KEY, on ? "0" : "1"); } catch { /* private mode */ }
      return !on;
    });
  }, []);

  const {
    hasAccess,
    markContentAsPurchased,
    setContent,
    setPriceCurrency,
    openModal,
    setError: setPaymentError,
  } = usePaymentStore();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);

        // Fetch from API
        const data = await getVideoById(videoId);

        // Transform API response to VideoDetail
        const videoDetail: VideoDetail = {
          id: data.id,
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnailUrl,
          videoUrl: data.videoUrl,
          author: data.author,
          authorAvatar: data.authorAvatar,
          authorBio: data.authorBio,
          duration: data.duration,
          postedDate: new Date(data.postedDate),
          rating: data.rating,
          ratingCount: data.ratingCount,
          category: data.category,
          tags: data.tags,
          price: data.price,
          currency: data.currency,
          isLive: data.isLive,
          classStartDate: data.classStartDate
            ? new Date(data.classStartDate)
            : undefined,
          viewsCount: data.viewsCount,
          userId: data.userId, // Include creator ID for access control
        };

        setVideo(videoDetail);
      } catch (err) {
        console.error("Failed to fetch video:", err);
        setError("Video not found");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    if (!video) return;

    const parsePrice = (p: unknown): number | undefined => {
      if (p === undefined || p === null) return undefined;
      if (typeof p === 'number') return p;
      if (typeof p === 'string') {
        const n = Number(p);
        if (!Number.isNaN(n)) return n;
        const parsed = parseFloat(p.replace(/[^0-9.]/g, ''));
        if (!Number.isNaN(parsed)) return parsed;
      }
      return undefined;
    };

    const videoPrice = parsePrice(video.price);

    // Step 1: Check if current user is the creator/owner
    if (user && video.userId && (String(user.id) === String(video.userId))) {
      setHasAccessToVideo(true);
      setIsCheckingAccess(false);
      return;
    }

    // Step 2: free video
    if (videoPrice === undefined || videoPrice === null || (typeof videoPrice === 'number' && videoPrice <= 0)) {
      setHasAccessToVideo(true);
      setIsCheckingAccess(false);
      return;
    }

    // Step 3: check local store
    try {
      const local = hasAccess('video', videoId, user?.id?.toString());
      if (local) {
        setHasAccessToVideo(true);
        setIsCheckingAccess(false);
        return;
      }
    } catch {
      // ignore store errors and continue to API
    }

    // Step 3.3: call checkAccess API
    let cancelled = false;
    (async () => {
      setIsCheckingAccess(true);
      try {
        const res = await checkAccess('video', videoId);
        type CheckAccessResponseExtended = typeof res & { isFree?: boolean };
        const result = res as CheckAccessResponseExtended;
        const isFreeServer = (result.isFree === true) || Number(result.price) === 0;
        if (isFreeServer || res.hasAccess) {
          try {
            markContentAsPurchased('video', videoId, user?.id?.toString());
          } catch {
            // swallow
          }
          if (!cancelled) setHasAccessToVideo(true);
        } else {
          const priceToShow = res.price ?? (videoPrice !== undefined ? String(videoPrice) : undefined);
          const currencyToShow = res.currency ?? video.currency ?? undefined;
          setPriceCurrency(priceToShow, currencyToShow);
          setContent('video', videoId);
          openModal();
          if (!cancelled) setHasAccessToVideo(false);
        }
      } catch {
        // On error, if video appears free grant access, else show payment modal
        if (videoPrice !== undefined && videoPrice <= 0) {
          if (!cancelled) setHasAccessToVideo(true);
        } else {
          try {
            setPaymentError('Unable to verify access. Please try again.');
            setPriceCurrency(videoPrice !== undefined ? String(videoPrice) : undefined, video.currency ?? undefined);
            setContent('video', videoId);
            openModal();
          } catch {
            // swallow
          }
          if (!cancelled) setHasAccessToVideo(false);
        }
      } finally {
        if (!cancelled) setIsCheckingAccess(false);
      }
    })();

    return () => { cancelled = true };
  }, [video, videoId, user, hasAccess, markContentAsPurchased, setContent, setPriceCurrency, openModal, setPaymentError]);


  const isOwner = Boolean(user && video?.userId && String(user.id) === String(video.userId));
  const upNext = useUpNext({ id: videoId, userId: video?.userId, category: video?.category });
  // Only a right-hand column when there's something to put in it.
  const hasUpNext = upNext.items.length > 0;

  // Back stays inside Hallos: someone who opened a shared link goes to the dashboard.
  const handleBack = () => {
    let sameSite = false;
    try { sameSite = Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin; } catch { /* no referrer */ }
    if (sameSite && window.history.length > 1) router.back();
    else router.push("/dashboard");
  };

  if (loading || isCheckingAccess) return <VideoPageSkeleton />;

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background-darker flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-text-primary font-semibold">This video isn’t available</p>
        <p className="text-sm text-text-muted">It may have been removed or made private.</p>
        <Button variant="primary" onClick={() => router.push("/dashboard")}>Back to dashboard</Button>
      </div>
    );
  }

  const player = hasAccessToVideo ? (
    <VideoPlayer
      videoUrl={video.videoUrl}
      thumbnail={video.thumbnail}
      title={video.title}
      videoId={video.id}
      theater={theater && hasUpNext}
      onToggleTheater={hasUpNext ? toggleTheater : undefined}
      onBack={handleBack}
    />
  ) : (
    <Paywall thumbnail={video.thumbnail} onBuy={() => { setContent('video', videoId); openModal(); }} />
  );

  return (
    <div className="min-h-screen bg-background-darker">
      {/* Desktop: a slim bar to get back (the dashboard header is hidden here). */}
      <div className="hidden md:flex items-center px-6 pt-4">
        <button onClick={handleBack} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-text-primary hover:bg-white/[0.08]" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>
      </div>

      {/*
        One grid; the player never moves in it (so switching theater mode never
        restarts the video). Desktop: player and details on the left, "Up next"
        on the right; theater: the player spans both columns. With nothing to
        recommend there's no right column at all.
      */}
      <div className={`mx-auto grid max-w-[1500px] gap-x-6 md:px-6 md:py-4 ${hasUpNext ? 'lg:grid-cols-[minmax(0,1fr)_400px]' : ''}`}>
        {/* Phones: the player stays at the top while the details scroll (YouTube app). */}
        <div className={`sticky top-0 z-30 bg-black md:static md:bg-transparent ${theater && hasUpNext ? 'lg:col-span-2' : ''}`}>
          {player}
        </div>
        <main className="flex min-w-0 flex-col gap-4 p-4 md:px-0 lg:col-start-1">
          <VideoInfo video={video} isOwner={isOwner} />
          <VideoDescription description={video.description} category={video.category} tags={video.tags} />
          <div className="pt-2 lg:hidden">
            <UpNextList items={upNext.items} isLoading={false} />
          </div>
        </main>
        {hasUpNext && (
          <aside className={`hidden lg:col-start-2 lg:block ${theater ? 'lg:row-start-2 pt-4' : 'lg:row-start-1 lg:row-span-2'}`}>
            <UpNextList items={upNext.items} isLoading={false} />
          </aside>
        )}
      </div>
      <PaymentModal />
    </div>
  );
}

/** Paid video, not bought yet: the poster with a clear way to buy (same 16:9 frame as the player). */
function Paywall({ thumbnail, onBuy }: { thumbnail: string; onBuy: () => void }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black md:rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails come from several hosts */}
      {thumbnail && <img src={thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm" />}
      <div className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-text-primary">
        <Lock className="h-8 w-8" aria-hidden />
        <p className="font-semibold">Buy this video to watch it</p>
        <Button onClick={onBuy} variant="primary">Buy to watch</Button>
      </div>
    </div>
  );
}
