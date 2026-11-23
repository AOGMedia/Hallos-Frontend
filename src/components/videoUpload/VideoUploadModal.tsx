"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useVideoUploadStore } from "@/store/videoUploadStore";
import { StepProgressTracker } from "./StepProgressTracker";
import { SidebarTabs } from "./SidebarTabs";
import { CancelConfirmationModal } from "./CancelConfirmationModal";
import { FileUploadStep } from "./steps/FileUploadStep";
import { VideoDetailsStep } from "./steps/VideoDetailsStep";
import { VideoElementsStep } from "./steps/VideoElementsStep";
import { VisibilityStep } from "./steps/VisibilityStep";
import { GoLiveStep } from "./steps/GoLiveStep";
import { PublishingProgress } from "./PublishingProgress";import { UploadSuccessView } from "./UploadSuccessView";
import { Button } from "@/components/ui/Button";
import { UploadStep, UploadMode } from "@/types/videoUpload";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
import { UploadHeader } from "./UploadHeader";
import {
  useInitializeVideoUpload,
  buildInitializeFormData,
  performDirectUpload,
} from "@/hooks/useVideoUpload";
import { VideoType, AgeRestriction } from "@/types/videoUpload";
import { useAuthStore } from "@/store/authStore";
import { queryClient } from "@/lib/queryClient";
import { useVideoModalStore } from "@/store/videoModalStore";
import { uploadEngine } from "./uploadEngine";
import { UploadStatusStrip } from "./UploadStatus";
import { useUploadProgress } from "@/hooks/useVideoUpload";
import { getMyVideos, publishDraft } from "@/lib/api/videos";

export function VideoUploadModal() {
  // The real upload (it starts when the file is picked and carries on while
  // the details are filled in; see uploadEngine).
  const upload = useUploadProgress();
  const [publishError, setPublishError] = useState<string | null>(null);
  const publishedVideoIdRef = useRef<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"upload" | "import" | "shorts">(
    "upload"
  );
  const [cancelToastVisible, setCancelToastVisible] = useState(false);
  const [communitySubmissionMessage, setCommunitySubmissionMessage] = useState("");

  // Abort controller for publishing upload
  const publishAbortRef = useRef<AbortController | null>(null);

  const {
    currentStep,
    isUploading,
    uploadMode,
    selectedFile,
    videoTitle,
    thumbnailPreview,
    showCancelModal,
    isPublishing,
    publishProgress,
    uploadComplete,
    category,
    // setCurrentStep,
    setUploadMode,
    previousStep,
    nextStep,
    setShowCancelModal,
    cancelUpload,
    setIsPublishing,
    setPublishProgress,
    setUploadComplete,
    resetUpload,
  } = useVideoUploadStore();

  const initializeMutation = useInitializeVideoUpload();
  const { isAuthenticated } = useAuthStore();

  const handleGoLive = () => {
    setUploadMode(UploadMode.GO_LIVE);
  };

  const handleGoLiveWithVideo = () => {
    setUploadMode(UploadMode.GO_LIVE);
  };

  const handleNext = () => {
    if (currentStep === UploadStep.VISIBILITY) {
      handleFinishAndPublish();
    } else {
      nextStep();
    }
  };

  const showCancelledToast = () => {
    setCancelToastVisible(true);
    setTimeout(() => setCancelToastVisible(false), 1600);
  };

  const handleFinishAndPublish = async () => {
    if (!isAuthenticated) {
      alert("Please sign in to upload a video.");
      window.location.href = "/signin";
      return;
    }
    const file = useVideoUploadStore.getState().selectedFile;
    const engine = uploadEngine.getState();
    // The upload already started when the file was picked (a draft): publishing
    // only saves the details. Otherwise, the classic flow below.
    const draftId = engine.mode === "draft" ? engine.videoId : null;
    if (!file && !draftId) return;
    setPublishError(null);
    setIsPublishing(true);
    setPublishProgress(0);

    try {
      const formData = buildInitializeFormData({
        thumbnail: useVideoUploadStore.getState().thumbnailFile,
        title: useVideoUploadStore.getState().videoTitle,
        description: useVideoUploadStore.getState().videoDescription,
        price: useVideoUploadStore.getState().price
          ? Number(useVideoUploadStore.getState().price)
          : null,
        currency: useVideoUploadStore.getState().currency,
        type:
          useVideoUploadStore.getState().videoType === VideoType.SHORT
            ? "short"
            : "long",
        category: useVideoUploadStore.getState().category,
        tags: useVideoUploadStore.getState().tags,
        privacy: useVideoUploadStore.getState().privacy,
        restriction:
          useVideoUploadStore.getState().ageRestriction !== AgeRestriction.NONE,
      });

      if (draftId) {
        await publishDraft(draftId, formData);
        uploadEngine.markPublished();
        publishedVideoIdRef.current = draftId;
      } else if (file) {
        const initRes = await initializeMutation.mutateAsync(formData);
        const nested = initRes as unknown as {
          video?: { uploadUrl?: string; muxUploadUrl?: string };
        };
        const url =
          initRes.uploadUrl ??
          initRes.muxUploadUrl ??
          nested.video?.uploadUrl ??
          nested.video?.muxUploadUrl;

        if (!url) {
          throw new Error("Upload URL missing in initialize response");
        }

        if (!url.startsWith("https://")) {
          throw new Error("Invalid upload URL returned by server");
        }

        publishedVideoIdRef.current = initRes.videoId || initRes.assetId;

        if (uploadEngine.hasFile()) {
          // Chunked and resumable; progress and failures show on this screen.
          uploadEngine.markPublished();
          void uploadEngine.uploadTo(url).catch(() => {});
        } else {
          // Prepare abort controller
          publishAbortRef.current = new AbortController();
          await performDirectUpload(
            { ...initRes, uploadUrl: url, muxUploadUrl: url },
            file,
            (percent) => setPublishProgress(percent),
            publishAbortRef.current.signal
          );
          await finishWhenUploaded(false);
          return;
        }
      }

      await finishWhenUploaded();
    } catch (err) {
      const aborted = ((err instanceof Error && err.name === "AbortError") || useVideoUploadStore.getState().isCancelled);
      if (aborted) {
        setIsPublishing(false);
        setPublishProgress(0);
        showCancelledToast();
        return;
      }
      console.error("Publish error:", err);
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        alert("Your session has expired. Please sign in again.");
        window.location.href = "/signin";
        return;
      }
      setIsPublishing(false);
      setPublishError((err as Error).message || "We couldn’t publish your video. Please try again.");
    }
  };

  /**
   * Waits for the upload to finish (it may still be going when Publish is
   * pressed), then shows the success view. If the upload stops, this screen
   * shows why with "Try again"; the details are already saved.
   */
  const finishWhenUploaded = async (waitForEngine = true) => {
    if (waitForEngine && uploadEngine.getState().phase !== "idle") {
      try {
        await uploadEngine.whenDone();
      } catch {
        return;
      }
    }
    try {
      setIsPublishing(false);
      setUploadComplete(true);

      const communityId = useVideoModalStore.getState().communityId;
      let communityMsg = "";

      if (communityId) {
        try {
          const videoId = publishedVideoIdRef.current;
          if (videoId) {
            const { linkVideoToCommunity } = await import('@/lib/api/community');
            const linkRes = await linkVideoToCommunity(String(videoId), {
              communityId,
              communityVisibility: 'community_only',
            });
            
            if (linkRes.queued) {
              communityMsg = linkRes.message || "Your video has been submitted for moderator review.";
            } else {
              communityMsg = "Content added to community";
            }
          }
        } catch (err) {
          console.error("Failed to link video to community:", err);
        }
      }

      setCommunitySubmissionMessage(communityMsg);

      try {
        const uid = useAuthStore.getState().user?.id;
        if (uid) {
          await queryClient.invalidateQueries({ queryKey: ["user-videos-all", uid] });
        }
        await queryClient.invalidateQueries({ queryKey: ["user-videos-all"] });
      } catch {}
    } catch (err) {
      console.error("After-publish step failed:", err);
    }
  };

  const retryUpload = () => {
    void uploadEngine.retry();
    void finishWhenUploaded();
  };

  const handleCreateAnother = () => {
    uploadEngine.reset();
    publishedVideoIdRef.current = undefined;
    setPublishError(null);
    resetUpload();
  };

  // "Finish" on a draft in the uploads page opens /dashboard/create?draft=<id>.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("draft");
    if (!id) return;
    let cancelled = false;
    getMyVideos()
      .then((list) => {
        if (cancelled) return;
        window.history.replaceState(null, "", window.location.pathname);
        const draft = list.find((v) => v.id === id && v.isDraft);
        if (!draft) return;
        const uploaded = ["processing", "ready"].includes(draft.uploadStatus ?? "");
        const store = useVideoUploadStore.getState();
        store.resetUpload();
        store.setVideoTitle(draft.title);
        if (draft.type === "short") store.setVideoType(VideoType.SHORT);
        uploadEngine.attachDraft({ videoId: draft.id, fileName: draft.title, uploaded });
        if (uploaded) store.setCurrentStep(UploadStep.VIDEO_DETAILS);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGoToVideos = () => {
    // onClose();
    // Navigate to videos page
    window.location.href = "/dashboard/uploads";
  };

  const handleCancelClick = () => {
    if (isUploading || isPublishing) {
      setShowCancelModal(true);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case UploadStep.FILE_UPLOAD:
        return selectedFile !== null || upload.phase === "done";
      case UploadStep.VIDEO_DETAILS:
        return videoTitle.trim() !== "";
      case UploadStep.VIDEO_ELEMENTS:
        return true;
      case UploadStep.VISIBILITY:
        return category !== "";
      default:
        return false;
    }
  };

  return (
    <div className=" inset-0  flex items-center justify-center  p-0 md:p-4 overflow-y-auto scrollbar-hide ">
      <div
        className={`bg-background-dark rounded-[40px] w-full md:max-w-8xl my-8 relative `}
      >
        {/* Header */}
        <UploadHeader
          uploadMode={uploadMode}
          uploadComplete={uploadComplete}
          currentStep={currentStep}
          previousStep={previousStep}
          handleLiveBack={() => setUploadMode(UploadMode.UPLOAD)}
        />

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 p-6 md:p-10">
          {/* Sidebar */}
          {(uploadMode as UploadMode) !== UploadMode.GO_LIVE && (
            <div className="md:w-32 flex-shrink-0">
              <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-8 md:gap-10">
            {(uploadMode as UploadMode) === UploadMode.GO_LIVE ? (
              <GoLiveStep initialMode={useVideoModalStore.getState().goLiveInitialMode} />
            ) : uploadComplete ? (
              <UploadSuccessView
                videoTitle={videoTitle}
                videoDescription={
                  useVideoUploadStore.getState().videoDescription
                }
                price={useVideoUploadStore.getState().price}
                videoDuration={useVideoUploadStore.getState().videoDuration}
                thumbnailPreview={thumbnailPreview}
                onCreateAnother={handleCreateAnother}
                onGoToVideos={handleGoToVideos}
                communitySubmissionMessage={communitySubmissionMessage}
              />
            ) : isPublishing ? (
              <PublishingProgress
                progress={upload.phase === "idle" ? publishProgress : upload.percent}
                fileName={selectedFile?.name || upload.fileName || "video.mp4"}
                onCancel={handleCancelClick}
                upload={upload.phase === "idle" ? undefined : upload}
                onRetry={retryUpload}
              />
            ) : (
              <>
                {/* Progress Tracker - Hidden in Go Live mode */}
                {(uploadMode as UploadMode) !== UploadMode.GO_LIVE && (
                  <StepProgressTracker currentStep={currentStep} />
                )}

                {/* The upload carries on while the details are filled in. */}
                {currentStep > UploadStep.FILE_UPLOAD && <UploadStatusStrip />}

                {/* Step Content */}
                <div className="flex-1">
                  {currentStep === UploadStep.FILE_UPLOAD && (
                    <FileUploadStep onGoLive={handleGoLive} />
                  )}
                  {currentStep === UploadStep.VIDEO_DETAILS && (
                    <VideoDetailsStep
                      onGoLiveWithVideo={handleGoLiveWithVideo}
                    />
                  )}
                  {currentStep === UploadStep.VIDEO_ELEMENTS && (
                    <VideoElementsStep />
                  )}
                  {currentStep === UploadStep.VISIBILITY && <VisibilityStep />}
                </div>

                {/* Navigation Buttons */}
                {publishError && (
                  <p role="alert" className="text-accent-red text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    {publishError}
                  </p>
                )}
                {(selectedFile || upload.phase === "done") && !isUploading && !isPublishing && (
                  <div className="flex justify-end gap-4">
                    {currentStep > UploadStep.FILE_UPLOAD && (
                      <Button
                        variant="outline"
                        onClick={previousStep}
                        className="flex items-center gap-2 text-sm"
                      >
                        <ArrowLeftIcon width={18} height={14} color="#E5E5E5" />
                        Previous
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="flex items-center gap-2 bg-primary/50 hover:bg-primary/60 text-xs"
                    >
                      {currentStep === UploadStep.VISIBILITY
                        ? " publish"
                        : "Next"}
                      <ArrowRightIcon width={18} height={14} color="#E5E5E5" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <CancelConfirmationModal
          onConfirm={() => {
            cancelUpload();
            // Stops the real upload and removes the unpublished draft.
            void uploadEngine.cancel();
            setShowCancelModal(false);
            // Abort publishing upload if in progress
            if (publishAbortRef.current) {
              publishAbortRef.current.abort();
              publishAbortRef.current = null;
            }
            showCancelledToast();
          }}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
      <AnimatePresence>
        {cancelToastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1F2636] text-[#F2F2F2] px-4 py-2 rounded-full border border-[rgba(234,234,234,0.08)] shadow-lg"
          >
            Upload cancelled
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
