"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSeriesDetails, registerSeries, cancelSeriesRegistration } from '@/services/seriesService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { SessionList } from '@/components/series/details/SessionList';
import { SeriesInfoTabs } from '@/components/series/details/SeriesInfoTabs';
import { SeriesPricingCard } from '@/components/series/SeriesPricingCard';
import { usePaymentStore } from '@/store/paymentStore';
import { trackReferralClick } from '@/lib/api/referral';
import { seriesIdFromParam } from '@/lib/live/seriesUrl';
import { Share2, Check } from 'lucide-react';
import { RegistrationSuccess } from '@/components/event/RegistrationSuccess';
import type { Series } from '@/types/series';
import type { PublicSeriesDetail } from '@/lib/seo/publicApi';

/**
 * `initialSeries` is the public (anonymous) copy fetched on the server, so the
 * title, description and sessions render immediately and are crawlable. Anything
 * that depends on the viewer — price/enrol buttons, access, registration — waits
 * for the signed-in query, exactly as before, so nobody is ever shown a "buy"
 * button for something they already own.
 */
export default function SeriesDetailPage({ initialSeries = null }: { initialSeries?: PublicSeriesDetail | null }) {
  const params = useParams();
  const router = useRouter();
  // The route param may be "<title-slug>-<uuid>"; every API call uses the bare id.
  const id = seriesIdFromParam(params.id as string);
  const { user, userId, loading: userLoading } = useCurrentUser();

  const { hasAccess: hasStoredAccess, markContentAsPurchased, cleanupGlobalPurchases } = usePaymentStore();

  useEffect(() => {
    cleanupGlobalPurchases();
  }, [cleanupGlobalPurchases]);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) {
      trackReferralClick(ref).catch(() => {});
    }
  }, []);

  // Local registration state — separate from query data to avoid refetch resets
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const { data: series, isLoading: isSeriesLoading, error, refetch } = useQuery<Series>({
    queryKey: ['series-details', id],
    queryFn: () => getSeriesDetails(id),
    enabled: !!id && !userLoading,
    staleTime: 30_000,
  });

  // Sync isRegistered from query data — only set true, never reset a locally confirmed true
  useEffect(() => {
    if (series?.isRegistered) {
      setIsRegistered(true);
    }
  }, [series?.isRegistered]);

  // Handle payment callback (after successful payment)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success' && userId) {
      // Mark as purchased in payment store immediately
      markContentAsPurchased('live_series', id, userId);

      // Refetch with retries to confirm backend access
      const refetchWithRetry = async () => {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, attempts === 0 ? 500 : 1500));
          const result = await refetch();

          if (result.data?.hasAccess) {
            break;
          }
          attempts++;
        }
      };

      refetchWithRetry();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refetch, markContentAsPurchased, id, userId]);

  // What the page shows: the viewer's own data once loaded, the public copy until then.
  const display = series ?? initialSeries;
  // Viewer-specific controls (price, enrol, register) only once the signed-in data is in.
  const viewerReady = !!series && !userLoading;
  const isLoading = !display && (isSeriesLoading || userLoading);

  const isCreator = useMemo(() => {
    if (!userId || !series) return false;
    return String(series.userId) === String(userId);
  }, [userId, series]);

  const hasAccess = series?.hasAccess || hasStoredAccess('live_series', id, userId) || isCreator;

  const hasPricingData = series && 'pricing' in series && series.pricing !== undefined;

  const isFree = useMemo(() => {
    if (!series) return false;
    if (hasPricingData && series.pricing) {
      const ngnPrice = series.pricing.NGN !== undefined ? series.pricing.NGN : (series.pricing as { ngn?: number }).ngn;
      const usdPrice = series.pricing.USD !== undefined ? series.pricing.USD : (series.pricing as { usd?: number }).usd;
      if (ngnPrice !== undefined && usdPrice !== undefined) {
        return Number(ngnPrice) === 0 && Number(usdPrice) === 0;
      }
    }
    const price = typeof series.price === 'number' ? series.price : parseFloat(series.price as string || '0');
    return price === 0;
  }, [series, hasPricingData]);

  const handleManageSeries = () => router.push(`/series/manage/${id}`);

  const handleEnrollmentSuccess = () => {
    refetch();
  };

  const handleRegister = async () => {
    if (!user) {
      router.push(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setRegistering(true);
    try {
      await registerSeries(id);
      setIsRegistered(true);
      setShowSuccessModal(true);
      refetch();
    } catch (e: unknown) {
      const err = e as Error & { response?: { status?: number } };
      const status = err.response?.status;
      const isAlreadyRegistered =
        status === 409 ||
        err.message?.toLowerCase().includes('already') ||
        err.message?.toLowerCase().includes('conflict') ||
        err.message?.toLowerCase().includes('409');

      if (isAlreadyRegistered) {
        // Already registered — update UI without re-fetching (would reset state)
        setIsRegistered(true);
        setShowSuccessModal(true);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user) return;
    setRegistering(true);
    try {
      await cancelSeriesRegistration(id);
      setIsRegistered(false);
      refetch();
    } catch {
      // silent
    } finally {
      setRegistering(false);
    }
  };

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-text-muted">Loading series...</p>
        </div>
      </div>
    );
  }

  if (error && !display) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load series</p>
          <Button variant="secondary" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!display) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary mb-4">Series not found</p>
          <Button variant="secondary" onClick={() => router.push('/dashboard/classes')}>Browse Classes</Button>
        </div>
      </div>
    );
  }

  const pricingCard = viewerReady && series ? (
    <SeriesPricingCard
      seriesId={id}
      seriesTitle={series.title}
      pricing={series.pricing}
      isCreator={!!isCreator}
      hasAccess={!!hasAccess}
      isFree={isFree}
      user={user}
      onSuccess={handleEnrollmentSuccess}
      onManage={handleManageSeries}
      isRegistered={isRegistered}
      registering={registering}
      onRegister={handleRegister}
      onCancelRegistration={handleCancelRegistration}
    />
  ) : error ? (
    <div className="bg-background-card p-6 rounded-lg text-sm text-text-muted">
      Couldn&apos;t load enrolment options.{' '}
      <button onClick={() => refetch()} className="text-primary hover:underline">Try again</button>
    </div>
  ) : (
    // Holds the card's place while the viewer's access and pricing load.
    <div aria-busy="true" aria-label="Loading enrolment options" className="bg-background-card rounded-lg p-6 animate-pulse min-h-[220px]" />
  );

  return (
    <div className="min-h-screen bg-background-darker">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 lg:gap-8 lg:items-start">
          {/* Left Column */}
          <div className="flex min-w-0 flex-col gap-6">
            {/* Thumbnail: edge to edge on phones, inside its column from lg up */}
            <div className="relative w-[calc(100%+2rem)] -mx-4 lg:w-full lg:mx-0 lg:rounded-xl overflow-hidden aspect-video">
              {display.thumbnailUrl ? (
                <>
                  <Image src={display.thumbnailUrl} alt="" fill className="object-cover scale-110 blur-sm brightness-100" aria-hidden="true" />
                  <Image src={display.thumbnailUrl} alt={display.title} fill className="object-contain relative z-10" />
                </>
              ) : (
                <div className="flex items-center justify-center min-h-[160px] text-text-muted">No thumbnail available</div>
              )}
              <div className="absolute top-3 left-3 bg-primary px-2 py-1 rounded-md text-white text-xs font-semibold">SERIES</div>
              {(display.stats?.liveSessions || 0) > 0 && (
                <div className="absolute top-3 right-3 bg-accent-red px-2 py-1 rounded-md text-white text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE NOW
                </div>
              )}
            </div>

            {/* Pricing Card - mobile */}
            <div className="lg:hidden">{pricingCard}</div>

            {/* Title and Description */}
            <div className="flex min-w-0 flex-col gap-4 [overflow-wrap:anywhere]">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-primary">{display.title}</h1>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">{display.creator?.firstname?.charAt(0) || 'U'}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-text-primary font-medium text-sm">
                    {display.creator ? `${display.creator.firstname} ${display.creator.lastname}` : 'Unknown Creator'}
                  </p>
                  <p className="text-text-muted text-xs">Series Creator</p>
                </div>
              </div>

              {display.description && (
                <div className="bg-background-card p-4 rounded-lg">
                  <h2 className="text-base lg:text-lg font-semibold text-text-primary mb-2">About this Series</h2>
                  <p className="text-text-muted text-sm whitespace-pre-wrap">{display.description}</p>
                </div>
              )}

              <div className="bg-background-card p-4 rounded-lg grid grid-cols-3 gap-2">
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Total Sessions</p>
                  <p className="text-lg font-bold text-text-primary">{display.stats?.totalSessions || 0}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Completed</p>
                  <p className="text-lg font-bold text-text-primary">{display.stats?.completedSessions || 0}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Duration</p>
                  <p className="text-lg font-bold text-text-primary">{display.recurrencePattern?.duration ?? 0} min</p>
                </div>
              </div>

              {/* Until the viewer's data is in, the public price decides whether How to pay shows. */}
              <SeriesInfoTabs
                isCreator={!!isCreator}
                isFree={viewerReady ? isFree : Number(display.price ?? 1) === 0}
                hasAccess={viewerReady && !!hasAccess}
                isRegistered={isRegistered}
                interactive={display.streamingProvider === 'getstream'}
              />

              <div className="bg-background-card p-4 lg:p-6 rounded-lg">
                <h2 className="text-base lg:text-lg font-semibold text-text-primary mb-4">Sessions</h2>
                <SessionList seriesId={id} isCreator={!!isCreator} showActions={!!hasAccess} streamingProvider={display.streamingProvider} />
              </div>
            </div>
          </div>

          {/* Right Column - desktop */}
          <div className="hidden lg:flex flex-col gap-4 lg:min-w-[320px]">
            {pricingCard}

            <div className="bg-background-card p-6 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Status</span>
                  <span className="text-text-primary capitalize">{display.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Privacy</span>
                  <span className="text-text-primary capitalize">{display.privacy}</span>
                </div>
                {display.stats?.nextSession && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Next Session</span>
                    <span className="text-text-primary">Session {display.stats.nextSession.sessionNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <Button variant="secondary" onClick={() => router.back()} className="w-full">Go Back</Button>
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-gray hover:text-text-primary transition-colors"
            >
              {shareCopied ? <Check size={15} className="text-green-500" /> : <Share2 size={15} />}
              {shareCopied ? 'Link copied!' : 'Share series'}
            </button>
          </div>

          {/* Back Button - mobile */}
          <div className="lg:hidden flex flex-col gap-2">
            <Button variant="secondary" onClick={() => router.back()} className="w-full">Go Back</Button>
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-gray hover:text-text-primary transition-colors"
            >
              {shareCopied ? <Check size={15} className="text-green-500" /> : <Share2 size={15} />}
              {shareCopied ? 'Link copied!' : 'Share series'}
            </button>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <RegistrationSuccess
          title="Successful!"
          subtitle={`Thank You ${user?.firstname || 'Participant'}!`}
          message="You've officially reserved your spot for this live series. You will receive reminders before each session starts."
          onClose={() => setShowSuccessModal(false)}
          zIndex={1000}
        />
      )}
    </div>
  );
}
