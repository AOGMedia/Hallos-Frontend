'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Download, Loader2, RotateCcw, Search, XCircle } from 'lucide-react';
import { emailPortalService, portalErrorMessage } from '@/services/emailPortalService';
import type { Audience, Campaign, RecipientPage, RecipientStatus } from '@/types/emailPortal';
import { usePortal } from '@/components/email-portal/PortalProvider';
import EmailPreview from '@/components/email-portal/EmailPreview';
import {
  Card,
  dangerButton,
  formatDateTime,
  formatNumber,
  inputClass,
  ProgressBar,
  secondaryButton,
  Spinner,
  StatusBadge,
} from '@/components/email-portal/ui';

const RECIPIENT_FILTERS: { label: string; value: '' | RecipientStatus }[] = [
  { label: 'All', value: '' },
  { label: 'Sent', value: 'sent' },
  { label: 'Waiting', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Skipped', value: 'skipped' },
];

const PRESET_LABELS: Record<string, string> = {
  today: 'signed up today',
  last_7_days: 'signed up in the last 7 days',
  last_30_days: 'signed up in the last 30 days',
  this_month: 'signed up this month',
  last_month: 'signed up last month',
  custom: 'signed up in a custom date range',
};

const describeAudience = (audience: Audience): string[] => {
  if (audience.mode === 'selected') return [`${formatNumber(audience.userIds.length)} hand-picked users`];
  const { filters } = audience;
  const parts: string[] = [];
  if (filters.signup.preset) {
    parts.push(
      filters.signup.preset === 'custom' && (filters.signup.from || filters.signup.to)
        ? `signed up ${filters.signup.from ?? 'the beginning'} to ${filters.signup.to ?? 'today'}`
        : PRESET_LABELS[filters.signup.preset]
    );
  }
  if (filters.liveClassIds.length) parts.push(`joined ${filters.liveClassIds.length} selected live class${filters.liveClassIds.length > 1 ? 'es' : ''}`);
  if (filters.liveSeriesIds.length) parts.push(`enrolled in ${filters.liveSeriesIds.length} selected series`);
  if (filters.purchased) parts.push(filters.purchased === 'yes' ? 'has bought something' : 'has not bought anything');
  if (filters.joinedLiveClass) parts.push(filters.joinedLiveClass === 'yes' ? 'has joined a live class' : 'has never joined a live class');
  if (filters.includeAdmins) parts.push('includes staff');
  if (audience.excludeUserIds.length) parts.push(`${formatNumber(audience.excludeUserIds.length)} people left out`);
  return parts.length ? parts : ['All users'];
};

function CountTile({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-bold ${tone}`}>{formatNumber(value)}</p>
    </div>
  );
}

export default function CampaignDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { notify } = usePortal();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<RecipientPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [filter, setFilter] = useState<'' | RecipientStatus>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<'cancel' | 'retry' | 'export' | null>(null);
  const liveRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const loadCampaign = useCallback(async () => {
    try {
      const result = await emailPortalService.getCampaign(id);
      setCampaign(result);
      liveRef.current = result.status === 'sending' || result.status === 'scheduled';
    } catch (err) {
      notify(portalErrorMessage(err, 'Could not load this campaign'), 'error');
      router.replace('/email-portal');
    } finally {
      setLoading(false);
    }
  }, [id, notify, router]);

  const loadRecipients = useCallback(
    async (silent = false) => {
      if (!silent) setRecipientsLoading(true);
      try {
        setRecipients(await emailPortalService.listRecipients(id, { status: filter || undefined, search: debouncedSearch || undefined, page, limit: 25 }));
      } catch {
        // the campaign loader already reports a missing campaign
      } finally {
        if (!silent) setRecipientsLoading(false);
      }
    },
    [id, filter, debouncedSearch, page]
  );

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (liveRef.current && document.visibilityState === 'visible') {
        loadCampaign();
        loadRecipients(true);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [loadCampaign, loadRecipients]);

  const cancel = async () => {
    if (!window.confirm('Stop this campaign? Emails already sent cannot be recalled, but everyone still waiting will be skipped.')) return;
    setBusy('cancel');
    try {
      setCampaign(await emailPortalService.cancelCampaign(id));
      notify('Campaign cancelled');
      loadRecipients(true);
    } catch (err) {
      notify(portalErrorMessage(err, 'Could not cancel the campaign'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const retry = async () => {
    setBusy('retry');
    try {
      const result = await emailPortalService.retryFailed(id);
      setCampaign(result.campaign);
      liveRef.current = true;
      notify(`${formatNumber(result.retried)} failed email(s) queued to retry`);
      loadRecipients(true);
    } catch (err) {
      notify(portalErrorMessage(err, 'Could not retry the failed emails'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const exportCsv = async () => {
    if (!campaign) return;
    setBusy('export');
    try {
      await emailPortalService.downloadRecipientsCsv(id, campaign.name);
    } catch (err) {
      notify(portalErrorMessage(err, 'Could not export the recipients'), 'error');
    } finally {
      setBusy(null);
    }
  };

  if (loading || !campaign) return <Spinner label="Loading campaign..." />;

  const { counts } = campaign;
  const done = counts.sent + counts.failed + counts.skipped;
  const canCancel = campaign.status === 'sending' || campaign.status === 'scheduled';
  const canRetry = counts.failed > 0 && (campaign.status === 'completed' || campaign.status === 'sending');

  return (
    <div className="space-y-6">
      <div>
        <Link href="/email-portal" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-200">
          <ArrowLeft size={15} />
          All campaigns
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-100">{campaign.name}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <p className="mt-1 text-sm text-zinc-400">{campaign.subject}</p>
            <p className="mt-1 text-xs text-zinc-600">
              Created {formatDateTime(campaign.createdAt)}
              {campaign.createdByName ? ` by ${campaign.createdByName}` : ''}
              {campaign.status === 'scheduled' && campaign.scheduledFor ? ` · scheduled for ${formatDateTime(campaign.scheduledFor)}` : ''}
              {campaign.completedAt ? ` · finished ${formatDateTime(campaign.completedAt)}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => router.push(`/email-portal/compose?copy=${campaign.id}`)} className={secondaryButton}>
              <Copy size={16} />
              Duplicate
            </button>
            <button onClick={exportCsv} disabled={busy === 'export'} className={secondaryButton}>
              {busy === 'export' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Export CSV
            </button>
            {canRetry && (
              <button onClick={retry} disabled={busy === 'retry'} className={secondaryButton}>
                {busy === 'retry' ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
                Retry {formatNumber(counts.failed)} failed
              </button>
            )}
            {canCancel && (
              <button onClick={cancel} disabled={busy === 'cancel'} className={dangerButton}>
                {busy === 'cancel' ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Cancel campaign
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Card>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Delivery</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {formatNumber(done)} of {formatNumber(campaign.totalRecipients)} processed
                </p>
              </div>
              <p className="font-mono text-3xl font-bold text-zinc-100">
                {campaign.totalRecipients ? Math.round((done / campaign.totalRecipients) * 100) : 0}%
              </p>
            </div>
            <ProgressBar sent={counts.sent} failed={counts.failed} total={campaign.totalRecipients} />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <CountTile label="Sent" value={counts.sent} tone="text-emerald-400" />
              <CountTile label="Waiting" value={counts.pending} tone="text-zinc-200" />
              <CountTile label="Failed" value={counts.failed} tone="text-rose-400" />
              <CountTile label="Skipped" value={counts.skipped} tone="text-zinc-400" />
            </div>
            {campaign.status === 'sending' && counts.pending > 0 && (
              <p className="mt-4 rounded-xl bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200">
                Emails are going out gradually. If the hourly or daily limit is reached, sending pauses and resumes on its own — you don&apos;t need to keep this page open.
              </p>
            )}
            {counts.skipped > 0 && (
              <p className="mt-3 text-xs text-zinc-600">Skipped = people who unsubscribed after the campaign started, or emails cancelled before they were sent.</p>
            )}
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {RECIPIENT_FILTERS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setFilter(item.value);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filter === item.value ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-60">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className={`${inputClass} py-2 pl-9`} />
              </div>
            </div>

            {recipientsLoading && !recipients ? (
              <Spinner label="Loading recipients..." />
            ) : !recipients || recipients.recipients.length === 0 ? (
              <p className="px-6 py-14 text-center text-sm text-zinc-500">
                {campaign.status === 'draft' ? 'Recipients appear here once the campaign is sent.' : 'No recipients match.'}
              </p>
            ) : (
              <>
                <ul className="divide-y divide-zinc-800/70">
                  {recipients.recipients.map((recipient) => (
                    <li key={recipient.id} className="grid grid-cols-1 gap-1.5 px-5 py-3 sm:grid-cols-[minmax(0,1.6fr)_90px_150px] sm:items-center sm:gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {`${recipient.firstName ?? ''} ${recipient.lastName ?? ''}`.trim() || 'Unnamed user'}
                        </p>
                        <p className="truncate text-xs text-zinc-500">{recipient.email}</p>
                        {recipient.error && recipient.status !== 'sent' && (
                          <p className="mt-0.5 truncate text-[11px] text-rose-400" title={recipient.error}>
                            {recipient.error}
                          </p>
                        )}
                      </div>
                      <div>
                        <StatusBadge status={recipient.status} />
                      </div>
                      <p className="text-xs text-zinc-500">{recipient.sentAt ? formatDateTime(recipient.sentAt) : recipient.attempts > 0 ? `${recipient.attempts} attempt(s)` : '—'}</p>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
                  <span className="text-xs text-zinc-500">
                    {formatNumber(recipients.total)} recipients · page {recipients.page} of {recipients.totalPages}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={recipients.page <= 1}
                      aria-label="Previous page"
                      className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:text-white disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, recipients.totalPages))}
                      disabled={recipients.page >= recipients.totalPages}
                      aria-label="Next page"
                      className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:text-white disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Audience</p>
            <ul className="space-y-1.5 text-sm text-zinc-300">
              {describeAudience(campaign.audience).map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <EmailPreview subject={campaign.subject} preheader={campaign.preheader ?? ''} html={campaign.bodyHtml ?? ''} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
