"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TitleField, DescriptionField, PriceField, CategoryField, PrivacyField, MaxParticipantsField, StreamingProviderField, ThumbnailSection } from "@/components/videoUpload/steps/GoLiveParts";
import { DEFAULT_LIVE_PROVIDER, isLiveProvider, type LiveProvider } from "@/lib/live/providers";
import { CurrencyCode } from "@/types/videoUpload";
import { SeriesDateRangeField } from "./SeriesDateRangeField";
import { RecurrencePatternField } from "./RecurrencePatternField";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { createSeries } from "@/services/seriesService";
import {
  describeCreateError,
  retryStatusLabel,
  supportsIdempotentCreate,
  uploadProgressLabel,
} from "@/lib/api/resilientCreate";
import { clearSubmissionKey, fileSignature, submissionKeyFor } from "@/lib/drafts/submissionKey";
import { clearDraftFile, fileToDataUrl, loadDraftFile, saveDraftFile } from "@/lib/drafts/draftFileStore";

const DRAFT_KEY = "hallos-series-draft";
const SUBMISSION_SLOT = "live-series";
const THUMBNAIL_SLOT = "live-series-thumbnail";

const str = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);

function clearSeriesDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
  clearSubmissionKey(SUBMISSION_SLOT);
  void clearDraftFile(THUMBNAIL_SLOT);
}

// interface SeriesFormProps {
//   mode: 'single' | 'series';
//   onModeChange: (mode: 'single' | 'series') => void;
// }

export function SeriesForm() {
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(CurrencyCode.NGN);
  const [category, setCategory] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [streamingProvider, setStreamingProvider] = useState<LiveProvider>(DEFAULT_LIVE_PROVIDER);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Series-specific state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successCommunityId, setSuccessCommunityId] = useState<string | null>(null);
  const [alertState, setAlertState] = useState<{ open: boolean; message: string }>({ 
    open: false, 
    message: "" 
  });

  // Error state
  const [errors, setErrors] = useState<{
    title?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    recurrenceDays?: string;
    startTime?: string;
    duration?: string;
  }>({});

  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    void supportsIdempotentCreate("liveSeries");
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      const d = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
      if (d && typeof d === "object") {
        const set = (v: unknown, setter: (s: string) => void) => {
          const s = str(v);
          if (s !== undefined) setter(s);
        };
        set(d.title, setTitle);
        set(d.description, setDescription);
        set(d.price, setPrice);
        set(d.category, setCategory);
        set(d.maxParticipants, setMaxParticipants);
        set(d.startDate, setStartDate);
        set(d.endDate, setEndDate);
        set(d.startTime, setStartTime);
        set(d.duration, setDuration);
        if (Object.values(CurrencyCode).includes(d.currency as CurrencyCode)) setCurrency(d.currency as CurrencyCode);
        if (d.privacy === "public" || d.privacy === "private") setPrivacy(d.privacy);
        if (isLiveProvider(d.streamingProvider)) setStreamingProvider(d.streamingProvider);
        if (Array.isArray(d.recurrenceDays)) {
          setRecurrenceDays(d.recurrenceDays.filter((x): x is string => typeof x === "string"));
        }
      }
    } catch {}
    setDraftReady(true);

    let cancelled = false;
    void (async () => {
      const file = await loadDraftFile(THUMBNAIL_SLOT);
      if (!file || cancelled) return;
      const preview = await fileToDataUrl(file);
      if (!preview || cancelled) return;
      setThumbnail((prev) => prev ?? file);
      setThumbnailPreview((prev) => prev ?? preview);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          title,
          description,
          price,
          currency,
          category,
          privacy,
          maxParticipants,
          streamingProvider,
          startDate,
          endDate,
          recurrenceDays,
          startTime,
          duration,
        })
      );
    } catch {}
  }, [draftReady, title, description, price, currency, category, privacy, maxParticipants, streamingProvider, startDate, endDate, recurrenceDays, startTime, duration]);

  const handleThumbnailSelect = (file: File, preview: string) => {
    setThumbnail(file);
    setThumbnailPreview(preview);
    void saveDraftFile(THUMBNAIL_SLOT, file);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (recurrenceDays.length === 0) {
      newErrors.recurrenceDays = 'Select at least one day, one of the days must match start date';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!duration) {
      newErrors.duration = 'Duration is required';
    }

    const durationNum = parseInt(duration);
    if (duration && (isNaN(durationNum) || durationNum <= 0)) {
      newErrors.duration = 'Duration must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare request body
      const requestBody = {
        title,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined, // Store as currency amount (not kobo)
        currency: currency === CurrencyCode.NGN ? 'NGN' : 'USD',
        category: category || undefined,
        startDate,
        endDate,
        recurrencePattern: {
          days: recurrenceDays, // Already lowercase from RecurrencePatternField
          startTime,
          duration: parseInt(duration)
        },
        privacy,
        maxParticipants: parseInt(maxParticipants),
        streamingProvider,
      };

      console.log('Submitting series creation:', requestBody);
      console.log('Recurrence pattern:', JSON.stringify(requestBody.recurrencePattern));

      const idempotencyKey = submissionKeyFor(SUBMISSION_SLOT, {
        body: requestBody,
        thumbnail: fileSignature(thumbnail),
      });
      const response = await createSeries(requestBody, thumbnail || undefined, {
        idempotencyKey,
        onUploadProgress: (fraction) => setStatusLabel(uploadProgressLabel(fraction)),
        onRetryStatus: (s) => setStatusLabel(retryStatusLabel(s)),
      });

      if (response.success) {
        console.log('Series created successfully:', response.series);
        clearSeriesDraft();
        setSuccessMessage(
          response.idempotentReplay
            ? `Your series "${title}" was already created, so we did not create it twice. You will find it on your schedule.`
            : ""
        );

        // Link to community if in community context
        const seriesId = response.series?.id;
        if (seriesId) {
          const { useVideoModalStore } = await import('@/store/videoModalStore');
          const { pendingCommunityId, clearCommunityContext } = useVideoModalStore.getState();
          if (pendingCommunityId) {
            try {
              const { linkLiveSeriesToCommunity } = await import('@/lib/api/community');
              const linkRes = await linkLiveSeriesToCommunity(String(seriesId), {
                communityId: pendingCommunityId,
                communityVisibility: 'community_only',
              });
              
              if (linkRes.queued) {
                setSuccessMessage(linkRes.message || "Your series has been submitted for moderator review.");
              }
            } catch (err) {
              console.error('Failed to link series to community:', err);
            }
            setSuccessCommunityId(pendingCommunityId ?? null);
            clearCommunityContext();
          }
        }

        setShowSuccessModal(true);
      } else {
        setAlertState({
          open: true,
          message: response.message || 'Failed to create series. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error creating series:', error);
      setAlertState({
        open: true,
        message: await describeCreateError(error, 'An unexpected error occurred. Please try again.', 'liveSeries')
      });
    } finally {
      setIsLoading(false);
      setStatusLabel(null);
    }
  };

  const handleSuccessAction = () => {
    setShowSuccessModal(false);
    if (successCommunityId) {
      router.push(`/dashboard/community/${successCommunityId}`);
    } else {
      router.push('/dashboard/schedule');
    }
  };

  return (
    <>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column */}
        <div className="flex-1 live-event-card flex flex-col gap-10 bg-[#1F2636] shadow-2xl shadow-black/70">
          <TitleField value={title} onChange={setTitle} />
          {errors.title && (
            <div className="text-sm text-red-400 -mt-8">{errors.title}</div>
          )}

          <DescriptionField value={description} onChange={setDescription} />

          <PriceField 
            currency={currency} 
            onCurrencyChange={setCurrency} 
            price={price} 
            onPriceChange={setPrice} 
          />

          <CategoryField value={category} onChange={setCategory} />
          {errors.category && (
            <div className="text-sm text-red-400 -mt-8">{errors.category}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PrivacyField value={privacy} onChange={setPrivacy} />
            <MaxParticipantsField
              value={maxParticipants}
              onChange={setMaxParticipants}
              streamingProvider={streamingProvider}
            />
          </div>

          <StreamingProviderField kind="series" value={streamingProvider} onChange={setStreamingProvider} />

          <div className="border-t border-border/20 pt-6">
            <p className="text-sm text-text-primary/70 mb-6">
              Series are always scheduled. Every session uses the streaming method above.
            </p>
          </div>

          <SeriesDateRangeField
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            error={errors.startDate || errors.endDate}
          />

          <RecurrencePatternField
            selectedDays={recurrenceDays}
            startTime={startTime}
            duration={duration}
            onDaysChange={setRecurrenceDays}
            onStartTimeChange={setStartTime}
            onDurationChange={setDuration}
            errors={{
              days: errors.recurrenceDays,
              startTime: errors.startTime,
              duration: errors.duration
            }}
          />

          <ThumbnailSection 
            file={thumbnail} 
            preview={thumbnailPreview} 
            onFileSelect={handleThumbnailSelect} 
          />
        </div>

        {/* Right Column */}
        <div className="flex-1 live-event-card flex flex-col gap-4 bg-[#1F2636] shadow-2xl shadow-black/70 self-start p-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-text-primary">Series Summary</h3>
            
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-primary/70">Type:</span>
                <span className="text-text-primary font-medium">Recurring Series</span>
              </div>
              
              {recurrenceDays.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-primary/70">Days:</span>
                  <span className="text-text-primary font-medium capitalize">
                    {recurrenceDays.join(', ')}
                  </span>
                </div>
              )}
              
              {startTime && (
                <div className="flex justify-between">
                  <span className="text-text-primary/70">Time:</span>
                  <span className="text-text-primary font-medium">{startTime}</span>
                </div>
              )}
              
              {duration && (
                <div className="flex justify-between">
                  <span className="text-text-primary/70">Duration:</span>
                  <span className="text-text-primary font-medium">{duration} minutes</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {statusLabel || 'Creating Series...'}
                </>
              ) : (
                'Create Series'
              )}
            </button>

            <p className="text-xs text-text-primary/50 text-center">
              Sessions will be automatically generated based on your recurrence pattern
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Series Created!"
        description={successMessage || `Your series "${title}" has been successfully created. Sessions have been automatically generated.`}
        actionLabel={successCommunityId ? "Back to Community" : "View Schedule"}
        onAction={handleSuccessAction}
      />

      {/* Error Alert */}
      <AlertModal 
        isOpen={alertState.open}
        onClose={() => setAlertState({ open: false, message: "" })}
        message={alertState.message}
      />
    </>
  );
}
