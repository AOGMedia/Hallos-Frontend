"use client";

import {
  useEffect,
  useState,
  // useMemo
} from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
// import { ArrowLeft, ArrowRight } from 'lucide-react';
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { InstructorInfo } from "@/components/video/InstructorInfo";
import { VideoMetadata } from "@/components/video/VideoMetadata";
// import { CountdownTimer } from "@/components/video/CountdownTimer";
import { Button } from "@/components/ui/Button";
import { getVideoById } from "@/lib/api/videos";
import type { VideoDetail } from "@/types/video";
import { checkAccess } from '@/lib/api/payments';
import { usePaymentStore } from '@/store/paymentStore';
import { PaymentModal } from '@/components/payments/PaymentModal';
import { useCurrentUser } from "@/hooks/useCurrentUser";

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

  // const handleRegister = () => {
  //   // Handle registration logic
  //   console.log("Register for class:", video?.id);
  // };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      
      // <div className="min-h-screen bg-background-darker flex items-center justify-center">
      //   <div className="text-text-primary">Loading video...</div>
      // </div>
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">Loading video...</div>
      </div>
    );
  }

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">Verifying access…</div>
      </div>
    );
  }

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">Verifying access…</div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-text-primary">Video not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-darker">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors"
            aria-label="Go back"
          >
            <Image
              src="/icons/arrow-left.svg"
              alt="Back"
              width={19}
              height={14}
              className="w-[19px] h-[14px]"
            />
          </button>
          <h1 className="text-xl font-bold text-text-primary leading-5">
            {video.title}
          </h1>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          {/* Video and Details */}
          <div className="flex flex-col gap-6">
            {/* Video Player */}
            {hasAccessToVideo ? (
              <VideoPlayer
                videoUrl={video.videoUrl}
                thumbnail={video.thumbnail}
                title={video.title}
              />
            ) : (
              <div className="w-full aspect-video bg-[#0b0b0b] flex items-center justify-center text-center p-6 text-text-primary">
                <div>
                  <div className="text-medium font-semibold mb-2">Access restricted</div>
                  <div className="text-description mb-4">You need to purchase this content to watch it.</div>
                  <div className="flex justify-center">
                    <Button onClick={() => { setContent('video', videoId); openModal(); }} variant="primary">Buy to Watch</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Information */}
            <div className="flex flex-col gap-6">
              {/* Instructor Info */}
              <InstructorInfo
                name={video.author}
                avatar={video.authorAvatar}
                bio={video.authorBio}
              />

              {/* Metadata */}
              <VideoMetadata
                duration={video.duration}
                postedDate={video.postedDate}
                rating={video.rating}
                ratingCount={video.ratingCount}
              />
            </div>
          </div>

          {/* Right Column - Countdown and Register */}
          {/* <div className="flex flex-col gap-4 lg:min-w-[280px]"> */}
            {/* Countdown Timer */}
            {/* {video.classStartDate && (
              <CountdownTimer targetDate={video.classStartDate} />
            )} */}

            {/* Register Button */}
            {/* <Button
              variant="primary"
              size="lg"
              onClick={handleRegister}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>Register for class</span>
              <Image
                src="/icons/arrow-right.svg"
                alt=""
                width={18}
                height={14}
                className="w-[18px] h-[14px]"
              />
            </Button> */}
          {/* </div> */}
        </div>
      </div>
      <PaymentModal />
    </div>
  );
}
