'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ChevronLeft, ChevronRight, MailCheck, MailX, Plus, Search, Send, UserMinus } from 'lucide-react';
import { emailPortalService, portalErrorMessage } from '@/services/emailPortalService';
import type { Campaign, CampaignList, CampaignStatus, PortalStats } from '@/types/emailPortal';
import { usePortal } from '@/components/email-portal/PortalProvider';
import {
  Card,
  formatDateTime,
  formatNumber,
  inputClass,
  primaryButton,
  ProgressBar,
  Spinner,
  StatusBadge,
} from '@/components/email-portal/ui';

const STATUS_TABS: { label: string; value: '' | CampaignStatus }[] = [
  { label: 'All', value: '' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Sending', value: 'sending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

function StatTile({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-zinc-100">{value}</p>
        </div>
        <span className={`rounded-2xl p-3 ${tone}`}>{icon}</span>
      </div>
    </div>
  );
}

function UsageMeter({ label, used, cap }: { label: string; used: number; cap: number }) {
  const pct = cap > 0 ? Math.min((used / cap) * 100, 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-zinc-300">
          {formatNumber(used)} / {formatNumber(cap)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-amber-500' : 'bg-violet-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function EmailPortalHomePage() {
  const router = useRouter();
  const { notify } = usePortal();

  const [stats, setStats] = useState<PortalStats | null>(null);
  const [list, setList] = useState<CampaignList | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'' | CampaignStatus>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const activeRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [statsResult, listResult] = await Promise.all([
          emailPortalService.stats(),
          emailPortalService.listCampaigns({ page, limit: 12, status: status || undefined, search: debouncedSearch || undefined }),
        ]);
        setStats(statsResult);
        setList(listResult);
        activeRef.current = listResult.campaigns.some((c) => c.status === 'sending' || c.status === 'scheduled');
      } catch (err) {
        if (!silent) notify(portalErrorMessage(err, 'Could not load campaigns'), 'error');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [page, status, debouncedSearch, notify]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (activeRef.current && document.visibilityState === 'visible') load(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [load]);

  const openCampaign = (campaign: Campaign) =>
    router.push(campaign.status === 'draft' ? `/email-portal/compose?draft=${campaign.id}` : `/email-portal/campaigns/${campaign.id}`);

  const limits = stats?.limits;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Campaigns</h1>
          <p className="mt-1 text-sm text-zinc-500">Write, target and send emails, then track every delivery.</p>
        </div>
        <Link href="/email-portal/compose" className={primaryButton}>
          <Plus size={16} />
          New campaign
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Campaigns" value={stats ? formatNumber(stats.campaigns) : '—'} icon={<Send size={20} />} tone="bg-violet-500/10 text-violet-400" />
        <StatTile label="Emails sent" value={stats ? formatNumber(stats.totalSent) : '—'} icon={<MailCheck size={20} />} tone="bg-emerald-500/10 text-emerald-400" />
        <StatTile label="Failed" value={stats ? formatNumber(stats.totalFailed) : '—'} icon={<MailX size={20} />} tone="bg-rose-500/10 text-rose-400" />
        <StatTile label="Unsubscribed" value={stats ? formatNumber(stats.unsubscribed) : '—'} icon={<UserMinus size={20} />} tone="bg-amber-500/10 text-amber-400" />
      </div>

      {limits && (
        <Card>
          <div className="grid gap-5 sm:grid-cols-2">
            <UsageMeter label="Sent in the last hour" used={limits.sentLastHour} cap={limits.hourlyCap} />
            <UsageMeter label="Sent today" used={limits.sentToday} cap={limits.dailyCap} />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Emails are sent gradually to protect the mail account. Large campaigns continue automatically when the hourly or daily limit resets.
          </p>
        </Card>
      )}

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.label}
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  status === tab.value ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns" className={`${inputClass} py-2 pl-9`} />
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading campaigns..." />
        ) : !list || list.campaigns.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-zinc-300">{status || debouncedSearch ? 'No campaigns match your filters' : 'No campaigns yet'}</p>
            <p className="mt-1 text-sm text-zinc-500">Create your first campaign to start emailing your users.</p>
            <Link href="/email-portal/compose" className={`${primaryButton} mt-5`}>
              <Plus size={16} />
              New campaign
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,2.4fr)_110px_minmax(0,1.6fr)_150px_120px] gap-4 border-b border-zinc-800 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500 md:grid">
              <span>Campaign</span>
              <span>Status</span>
              <span>Delivery</span>
              <span>Created</span>
              <span>By</span>
            </div>
            <ul className="divide-y divide-zinc-800/70">
              {list.campaigns.map((campaign) => {
                const done = campaign.counts.sent + campaign.counts.failed + campaign.counts.skipped;
                return (
                  <li key={campaign.id}>
                    <button
                      onClick={() => openCampaign(campaign)}
                      className="grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-800/40 md:grid-cols-[minmax(0,2.4fr)_110px_minmax(0,1.6fr)_150px_120px] md:items-center md:gap-4"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-zinc-100">{campaign.name}</span>
                        <span className="block truncate text-xs text-zinc-500">{campaign.subject}</span>
                      </span>
                      <span>
                        <StatusBadge status={campaign.status} />
                      </span>
                      <span className="min-w-0">
                        {campaign.totalRecipients > 0 ? (
                          <>
                            <ProgressBar sent={campaign.counts.sent} failed={campaign.counts.failed} total={campaign.totalRecipients} />
                            <span className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[11px] text-zinc-500">
                              <span>
                                {formatNumber(done)} / {formatNumber(campaign.totalRecipients)} done
                              </span>
                              {campaign.counts.failed > 0 && (
                                <span className="flex items-center gap-1 text-rose-400">
                                  <AlertTriangle size={11} />
                                  {formatNumber(campaign.counts.failed)} failed
                                </span>
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-600">Not sent yet</span>
                        )}
                      </span>
                      <span className="text-xs text-zinc-400">{formatDateTime(campaign.scheduledFor && campaign.status === 'scheduled' ? campaign.scheduledFor : campaign.createdAt)}</span>
                      <span className="truncate text-xs text-zinc-400">{campaign.createdByName || '—'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {list.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3">
                <span className="text-xs text-zinc-500">
                  Page {list.page} of {list.totalPages} · {formatNumber(list.total)} campaigns
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={list.page <= 1}
                    aria-label="Previous page"
                    className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:text-white disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, list.totalPages))}
                    disabled={list.page >= list.totalPages}
                    aria-label="Next page"
                    className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:text-white disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
