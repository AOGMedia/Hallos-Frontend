"use client";

import { memo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveEventStore } from "@/store/liveEventStore";
import LiveEventActionBtn from "@/components/ui/LiveEventActionBtn";
import { TitleField, DescriptionField, PriceField, PrivacyField, StreamingProviderField, MaxParticipantsField, ToggleSchedule, ScheduleFields, ThumbnailSection, HostHeader, CategoryField } from "./GoLiveParts";
import { ModeToggle } from "@/components/series/form/ModeToggle";
import { SeriesForm } from "@/components/series/form/SeriesForm";
import { createLiveClass, type CreateLiveClassBody } from '@/services/liveClassService'
import { startZegoLive } from "@/services/zegoService";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { AlertModal } from "@/components/ui/AlertModal";

interface GoLiveStepProps {
  currentUserAvatar?: string;
  currentUserName?: string;
  initialMode?: 'single' | 'series';
}

export const GoLiveStep = memo(function GoLiveStep({
  currentUserAvatar = "https://i.pravatar.cc/150?img=12",
  currentUserName = "You",
  initialMode = 'single',
}: GoLiveStepProps) {
  const router = useRouter();
  const {
    liveEventTitle,
    liveEventDescription,
    liveEventPrice,
    liveEventCurrency,
    liveEventPrivacy,
    liveEventCategory,
    liveEventStreamingProvider,
    liveEventMaxParticipants,
    scheduleClass,
    scheduleDate,
    startTime,
    endTime,
    liveEventThumbnail,
    liveEventThumbnailPreview,
    setLiveEventTitle,
    setLiveEventDescription,
    setLiveEventPrice,
    setLiveEventCurrency,
    setLiveEventPrivacy,
    setLiveEventCategory,
    setLiveEventStreamingProvider,
    setLiveEventMaxParticipants,
    setScheduleClass,
    setScheduleDate,
    setStartTime,
    setEndTime,
    setLiveEventThumbnail,
  } = useLiveEventStore();

  const [mode, setMode] = useState<'single' | 'series'>(initialMode);

  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state
  const [successMessage, setSuccessMessage] = useState("");
  const [successCommunityId, setSuccessCommunityId] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  // const [createdClassId, setCreatedClassId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remove the mutation hook since we'll use the service directly
  // const createLiveClassMutation = useCreateLiveClass();

  const handleThumbnailSelect = useCallback(
    (file: File, preview: string) => {
      setLiveEventThumbnail(file, preview);
    },
    [setLiveEventThumbnail]
  );

  const handleGoLive = useCallback(async () => {
    // For immediate live, create the class first then redirect based on provider
    if (!liveEventTitle.trim()) {
      setAlertState({ open: true, message: "Please add a title for your class." });
      return;
    }

    if (!liveEventCategory) {
      setAlertState({ open: true, message: "Please select a category for your class." });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const priceNumber = liveEventPrice ? parseFloat(liveEventPrice) : undefined;

      const body: CreateLiveClassBody = {
        title: liveEventTitle,
        description: liveEventDescription || undefined,
        price: priceNumber,
        privacy: liveEventPrivacy,
        category: liveEventCategory || undefined,
        streamingProvider: liveEventStreamingProvider,
        maxParticipants: liveEventStreamingProvider === 'zegocloud' && liveEventMaxParticipants ? Number(liveEventMaxParticipants) : undefined,
      };

      const res = await createLiveClass(body, liveEventThumbnail ?? undefined);
      if (res.success && res.liveClass && res.liveClass.id) {
        // Link to community if in community context
        const { useVideoModalStore } = await import('@/store/videoModalStore');
        const { pendingCommunityId, clearCommunityContext } = useVideoModalStore.getState();
        let communityIdForRoom: string | null = null;
        let isQueued = false;
        let submissionMsg = "";

        if (pendingCommunityId) {
          try {
            const { linkLiveClassToCommunity } = await import('@/lib/api/community');
            const linkRes = await linkLiveClassToCommunity(String(res.liveClass.id), {
              communityId: pendingCommunityId,
              communityVisibility: 'community_only',
            });
            
            if (linkRes.queued) {
              isQueued = true;
              submissionMsg = linkRes.message || "Your live class has been submitted for moderator review.";
            }
            communityIdForRoom = pendingCommunityId;
          } catch (err) {
            console.error('Failed to link live class to community:', err);
          } finally {
            clearCommunityContext();
          }
        }

        if (isQueued) {
          setSuccessCommunityId(pendingCommunityId ?? null);
          setSuccessMessage(submissionMsg);
          setShowSuccessModal(true);
          return;
        }

        // Redirect based on streaming provider
        if (liveEventStreamingProvider === 'zegocloud') {
          await startZegoLive(res.liveClass.id);
          const roomUrl = communityIdForRoom
            ? `/live/${res.liveClass.id}/room?from=community&communityId=${communityIdForRoom}`
            : `/live/${res.liveClass.id}/room`;
          router.push(roomUrl);
        } else {
          router.push(`/live/creator/${res.liveClass.id}`);
        }
      } else {
        setError(res.message || 'Failed to create live class');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create live class');
    } finally {
      setLoading(false);
    }
  }, [
    liveEventTitle,
    liveEventDescription,
    liveEventPrice,
    liveEventPrivacy,
    liveEventCategory,
    liveEventStreamingProvider,
    liveEventMaxParticipants,
    liveEventThumbnail,
    router
  ]);

  const handleSendInvite = useCallback(async () => {
    if (!scheduleClass) return;
    if (!liveEventTitle.trim()) {
      setAlertState({ open: true, message: "Please add a title for your class." });
      return;
    }
    if (!scheduleDate || !startTime || !endTime) {
      setAlertState({ open: true, message: "Please choose date, start time, and end time." });
      return;
    }

    if (!liveEventCategory) {
      setAlertState({ open: true, message: "Please select a category for your class." });
      return;
    }

    // Validate that selected date and time are in the future
    const scheduledStartDateTime = new Date(`${scheduleDate}T${startTime}:00`);
    const scheduledEndDateTime = new Date(`${scheduleDate}T${endTime}:00`);
    const now = new Date();

    if (scheduledStartDateTime < now) {
      setAlertState({ open: true, message: "Please select a present or future date and time." });
      return;
    }

    if (scheduledEndDateTime <= scheduledStartDateTime) {
      setAlertState({ open: true, message: "End time must be after start time." });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const toIso = (d: string, t: string) => new Date(`${d}T${t}:00.000Z`).toISOString();
      const priceNumber = liveEventPrice ? parseFloat(liveEventPrice) : undefined;

      const body: CreateLiveClassBody = {
        title: liveEventTitle,
        description: liveEventDescription || undefined,
        price: priceNumber,
        startTime: toIso(scheduleDate, startTime),
        endTime: toIso(scheduleDate, endTime),
        privacy: liveEventPrivacy,
        category: liveEventCategory || undefined,
        streamingProvider: liveEventStreamingProvider,
        maxParticipants: liveEventStreamingProvider === 'zegocloud' && liveEventMaxParticipants ? Number(liveEventMaxParticipants) : undefined,
      };

      const res = await createLiveClass(body, liveEventThumbnail ?? undefined);
      if (res.success && res.liveClass && res.liveClass.id) {
        // Link to community if in community context
        const { useVideoModalStore } = await import('@/store/videoModalStore');
        const { pendingCommunityId, clearCommunityContext } = useVideoModalStore.getState();
        if (pendingCommunityId) {
          try {
            const { linkLiveClassToCommunity } = await import('@/lib/api/community');
            const linkRes = await linkLiveClassToCommunity(String(res.liveClass.id), {
              communityId: pendingCommunityId,
              communityVisibility: 'community_only',
            });
            
            if (linkRes.queued) {
              setSuccessMessage(linkRes.message || "Your scheduled class has been submitted for moderator review.");
            }
          } catch (err) {
            console.error('Failed to link live class to community:', err);
          }
          setSuccessCommunityId(pendingCommunityId ?? null);
          clearCommunityContext();
        }
        setShowSuccessModal(true);
      } else {
        setError(res.message || 'Failed to create live class');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create live class');
    } finally {
      setLoading(false);
    }
  }, [
    scheduleClass,
    liveEventTitle,
    liveEventDescription,
    liveEventPrice,
    liveEventPrivacy,
    liveEventCategory,
    liveEventStreamingProvider,
    liveEventMaxParticipants,
    scheduleDate,
    startTime,
    endTime,
    liveEventThumbnail,
  ]);


  return (
    <>
      <ModeToggle mode={mode} onModeChange={setMode} />
      {mode === 'single' && (
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column */}
          <div className="flex-1 live-event-card flex flex-col gap-10 bg-[#1F2636] shadow-2xl shadow-black/70- ">
            <TitleField value={liveEventTitle} onChange={setLiveEventTitle} />
            <DescriptionField value={liveEventDescription} onChange={setLiveEventDescription} />
            <PriceField currency={liveEventCurrency} onCurrencyChange={setLiveEventCurrency} price={liveEventPrice} onPriceChange={setLiveEventPrice} />
            <CategoryField value={liveEventCategory} onChange={setLiveEventCategory} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PrivacyField value={liveEventPrivacy} onChange={setLiveEventPrivacy} />
              <MaxParticipantsField 
                value={liveEventMaxParticipants} 
                onChange={setLiveEventMaxParticipants} 
                streamingProvider={liveEventStreamingProvider}
              />
            </div>
            <StreamingProviderField value={liveEventStreamingProvider} onChange={setLiveEventStreamingProvider} />
            <ToggleSchedule checked={scheduleClass} onChange={setScheduleClass} />
            {scheduleClass && (
              <ScheduleFields
                date={scheduleDate}
                onDateChange={setScheduleDate}
                startTime={startTime}
                onStartTimeChange={setStartTime}
                endTime={endTime}
                onEndTimeChange={setEndTime}
              />
            )}
            <ThumbnailSection file={liveEventThumbnail} preview={liveEventThumbnailPreview} onFileSelect={handleThumbnailSelect} />
          </div>

          {error && (
            <div className="text-accent-red text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <div className="flex-1 live-event-card flex flex-col gap-4 bg-[#1F2636] shadow-2xl shadow-black/70 self-start">
            <HostHeader name={currentUserName} avatar={currentUserAvatar} />
            <LiveEventActionBtn
              handleGoLive={handleGoLive}
              scheduleClass={scheduleClass}
              handleSendInvite={handleSendInvite}
              loading={loading}
            />
          </div>
        </div>
      )}

      {mode === 'series' && (
        <SeriesForm  />
      )}

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Class Scheduled!"
        description={successMessage || `Your class "${liveEventTitle}" has been successfully scheduled.`}
        actionLabel={successCommunityId ? "Back to Community" : "View Schedule"}
        onAction={() => {
          setShowSuccessModal(false);
          if (successCommunityId) {
            router.push(`/dashboard/community/${successCommunityId}`);
          } else {
            router.push("/dashboard/schedule");
          }
        }}
      />
      
      <AlertModal 
        isOpen={alertState.open}
        onClose={() => setAlertState(prev => ({ ...prev, open: false }))}
        message={alertState.message}
      />
    </>
  );
});
