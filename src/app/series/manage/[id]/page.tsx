"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSeriesDetails, cancelSeries } from '@/services/seriesService';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SeriesStats } from '@/components/series/details/SeriesStats';
import { SessionList } from '@/components/series/details/SessionList';
import { Button } from '@/components/ui/Button';
import { AlertModal } from '@/components/ui/AlertModal';
import Image from 'next/image';
import RegistrationsModal from '@/components/liveEvents/RegistrationsModal';
import {
  Copy, Eye, Check, DollarSign, Users,
  CalendarRange, Clock, Calendar, Tag, Repeat
} from 'lucide-react';

function QuickActionButton({
  icon: Icon,
  label,
  successLabel,
  onClick,
  variant = 'default',
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  successLabel?: string;
  onClick: () => void | Promise<void>;
  variant?: 'default' | 'primary';
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = async () => {
    if (state !== 'idle') return;
    setState('loading');
    try {
      await onClick();
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('idle');
    }
  };

  const isSuccess = state === 'success';
  const isLoading = state === 'loading';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`group w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
        isSuccess
          ? 'bg-green-500/10 border border-green-500/30 text-green-400'
          : variant === 'primary'
          ? 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40'
          : 'bg-white/[0.03] border border-white/[0.08] text-text-primary hover:bg-white/[0.07] hover:border-white/[0.15]'
      }`}
    >
      <span className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
        isSuccess ? 'bg-green-500/20' : variant === 'primary' ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'
      }`}>
        {isLoading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isSuccess ? (
          <Check size={14} className="text-green-400" />
        ) : (
          <Icon size={14} />
        )}
      </span>
      <span className="flex-1 text-left">
        {isSuccess && successLabel ? successLabel : label}
      </span>
    </button>
  );
}

export default function SeriesManagementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { userId } = useCurrentUser();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [alertState, setAlertState] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });
  const [showRegistrations, setShowRegistrations] = useState(false);

  const { data: series, isLoading, error } = useQuery({
    queryKey: ['series-management', id],
    queryFn: () => getSeriesDetails(id),
    enabled: !!id,
    refetchInterval: 30000,
  });

  const isCreator = useMemo(() => {
    if (!userId || !series) return false;
    return String(userId) === String(series.userId);
  }, [userId, series]);

  useEffect(() => {
    if (!isLoading && series && userId && !isCreator) {
      router.push(`/series/${id}`);
    }
  }, [isLoading, series, userId, isCreator, router, id]);

  if (!isLoading && series && userId && !isCreator) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-text-muted">Redirecting...</p>
        </div>
      </div>
    );
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

  if (error) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load series</p>
          <Button variant="secondary" onClick={() => router.push('/dashboard/classes')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background-darker flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary mb-4">Series not found</p>
          <Button variant="secondary" onClick={() => router.push('/dashboard/classes')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleConfirmCancel = async () => {
    setShowCancelConfirm(false);
    setIsCancelling(true);
    try {
      const response = await cancelSeries(id);
      if (response.success) {
        setAlertState({ open: true, message: 'Series cancelled successfully. All scheduled sessions have been cancelled.' });
        setTimeout(() => router.push('/dashboard/classes'), 2000);
      } else {
        setAlertState({ open: true, message: response.message || 'Failed to cancel series' });
      }
    } catch (err) {
      setAlertState({ open: true, message: err instanceof Error ? err.message : 'An error occurred while cancelling' });
    } finally {
      setIsCancelling(false);
    }
  };

  // Show base currency price — prefer NGN if set, else USD
  const getPriceLabel = () => {
    if (series.pricing) {
      if (series.pricing.ngn === 0 && series.pricing.usd === 0) return 'Free';
      if (series.pricing.ngn > 0 && series.pricing.usd > 0) {
        return `\u20a6${series.pricing.ngn.toLocaleString()} / $${series.pricing.usd}`;
      }
      if (series.pricing.ngn > 0) return `\u20a6${series.pricing.ngn.toLocaleString()}`;
      return `$${series.pricing.usd.toLocaleString()}`;
    }
    if (series.price) {
      const sym = series.currency === 'NGN' ? '\u20a6' : '$';
      return `${sym}${Number(series.price).toLocaleString()}`;
    }
    return 'Free';
  };

  const priceLabel = getPriceLabel();

  return (
    <div className="min-h-screen bg-background-darker">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <button onClick={() => router.push('/dashboard/classes')} className="hover:text-text-primary transition-colors">
            Dashboard
          </button>
          <span>/</span>
          <span className="text-text-primary">Manage Series</span>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            {series.thumbnailUrl && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={series.thumbnailUrl} alt={series.title} fill className="object-cover" />
              </div>
            )}
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-text-primary mb-2">{series.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  series.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-text-muted'
                }`}>{series.status}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize bg-white/5 text-text-muted">{series.privacy}</span>
                {series.category && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize bg-primary/10 text-primary">{series.category}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => router.push(`/series/${id}`)} className="text-sm">View Public Page</Button>
            <Button variant="secondary" onClick={() => router.push(`/series/manage/${id}/edit`)} className="text-sm">Edit Series</Button>
            {series.status === 'active' && (
              <Button variant="secondary" onClick={() => setShowCancelConfirm(true)} disabled={isCancelling} className="text-sm text-red-400 hover:text-red-300">
                {isCancelling ? 'Cancelling...' : 'Cancel Series'}
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left — Sessions */}
          <div className="bg-background-card p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">Sessions</h2>
              <span className="text-xs text-text-muted bg-white/5 px-2 py-1 rounded-full">
                {series.stats?.totalSessions || 0} total
              </span>
            </div>
            <SessionList seriesId={id} showActions={true} isCreator={true} />
          </div>

          {/* Right — Stats & Info */}
          <div className="space-y-4 bg-primary/20 rounded-md">
            <SeriesStats series={series} />

            {/* Series Details */}
            <div className="bg-background-card rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Series Details</h3>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Price', value: priceLabel },
                  { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Max Participants', value: String(series.maxParticipants ?? 'Unlimited') },
                  {
                    icon: CalendarRange, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Date Range',
                    value: `${new Date(series.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} \u2192 ${new Date(series.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  },
                  {
                    icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Session Time',
                    value: `${series.recurrencePattern.startTime} \u00b7 ${series.recurrencePattern.duration} min`
                  },
                  {
                    icon: Calendar, color: 'text-text-muted', bg: 'bg-white/5', label: 'Created',
                    value: new Date(series.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  },
                ].map(({ icon: Icon, color, bg, label, value }) => (
                  <div key={label} className="flex items-center gap-3 px-5 py-3">
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                      <Icon size={14} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted">{label}</p>
                      <p className="text-sm font-semibold text-text-primary truncate">{value}</p>
                    </div>
                  </div>
                ))}

                {/* Recurrence days */}
                <div className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Repeat size={14} className="text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted">Recurrence</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {series.recurrencePattern.days.map(day => (
                        <span key={day} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-text-primary capitalize">
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {series.category && (
                  <div className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                      <Tag size={14} className="text-pink-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted">Category</p>
                      <p className="text-sm font-semibold text-text-primary capitalize">{series.category}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background-card rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/5">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Quick Actions</h3>
              </div>
              <div className="p-3 space-y-2">
                <QuickActionButton
                  id="copy-link"
                  icon={Copy}
                  label="Copy Series Link"
                  successLabel="Link Copied!"
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/series/${id}`);
                  }}
                />
                <QuickActionButton
                  id="preview"
                  icon={Eye}
                  label="Preview as Student"
                  variant="primary"
                  onClick={() => router.push(`/series/${id}`)}
                />
                <QuickActionButton
                  id="registrations"
                  icon={Users}
                  label="View Registrations"
                  variant="default"
                  onClick={() => setShowRegistrations(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[10000] p-4">
          <div className="bg-background-dark rounded-2xl p-6 max-w-md w-full border border-border">
            <h3 className="text-base font-semibold text-text-primary text-center mb-3">Cancel Series?</h3>
            <p className="text-text-muted text-sm text-center mb-6">
              This will cancel all scheduled sessions. Completed sessions remain in history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowCancelConfirm(false)}>
                Keep Series
              </Button>
              <Button variant="primary" className="flex-1 bg-red-500 hover:bg-red-600" onClick={handleConfirmCancel}>
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertState.open}
        onClose={() => setAlertState({ open: false, message: '' })}
        message={alertState.message}
      />

      <RegistrationsModal
        isOpen={showRegistrations}
        onClose={() => setShowRegistrations(false)}
        entityId={id}
        entityTitle={series.title}
        entityType="series"
      />
    </div>
  );
}
