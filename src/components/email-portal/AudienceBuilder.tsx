'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Users, X } from 'lucide-react';
import { emailPortalService } from '@/services/emailPortalService';
import { emptyAudience } from '@/types/emailPortal';
import type { Audience, AudienceFilters, AudienceOptions, AudienceUser, SignupPreset, TriState } from '@/types/emailPortal';
import { formatDate, formatNumber, inputClass, Spinner } from './ui';

const PRESETS: { label: string; value: SignupPreset | null }[] = [
  { label: 'Any time', value: null },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: 'last_7_days' },
  { label: 'Last 30 days', value: 'last_30_days' },
  { label: 'This month', value: 'this_month' },
  { label: 'Last month', value: 'last_month' },
  { label: 'Custom range', value: 'custom' },
];

const TRI_OPTIONS: { label: string; value: TriState }[] = [
  { label: 'Any', value: null },
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

interface PickerOption {
  id: string;
  label: string;
  meta: string;
}

function MultiPicker({
  title,
  hint,
  options,
  selected,
  onToggle,
  emptyText,
}: {
  title: string;
  hint: string;
  options: PickerOption[];
  selected: string[];
  onToggle: (id: string) => void;
  emptyText: string;
}) {
  const [query, setQuery] = useState('');
  const visible = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query]
  );
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-zinc-200">{title}</p>
      <p className="mb-2 text-xs text-zinc-500">{hint}</p>

      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((id) => (
            <span key={id} className="flex max-w-full items-center gap-1 rounded-full bg-violet-600/20 py-1 pl-3 pr-1.5 text-xs font-semibold text-violet-200">
              <span className="truncate">{byId.get(id)?.label.trim() || 'Selected item'}</span>
              <button type="button" onClick={() => onToggle(id)} aria-label="Remove" className="rounded-full p-0.5 hover:bg-violet-500/30">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className={`${inputClass} mb-2 py-2`} />
      <div className="max-h-44 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950">
        {visible.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-zinc-600">{emptyText}</p>
        ) : (
          visible.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-start gap-2.5 border-b border-zinc-900 px-3 py-2 last:border-b-0 hover:bg-zinc-900">
              <input
                type="checkbox"
                checked={selected.includes(option.id)}
                onChange={() => onToggle(option.id)}
                className="mt-0.5 h-4 w-4 accent-violet-600"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm text-zinc-200">{option.label.trim()}</span>
                <span className="block text-[11px] text-zinc-500">{option.meta}</span>
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

function TriToggle({ label, value, onChange }: { label: string; value: TriState; onChange: (value: TriState) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-zinc-200">{label}</p>
      <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-950 p-0.5">
        {TRI_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
              value === option.value ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface AudienceBuilderProps {
  audience: Audience;
  onChange: (audience: Audience) => void;
  onTotalChange?: (total: number | null) => void;
}

export default function AudienceBuilder({ audience, onChange, onTotalChange }: AudienceBuilderProps) {
  const [options, setOptions] = useState<AudienceOptions | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const [users, setUsers] = useState<AudienceUser[]>([]);
  const [usersPage, setUsersPage] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pickedUsers, setPickedUsers] = useState<Record<number, AudienceUser>>({});

  const isPickMode = audience.mode === 'selected';
  const { filters } = audience;
  const audienceKey = JSON.stringify(audience);

  useEffect(() => {
    emailPortalService.audienceOptions().then(setOptions).catch(() => setOptions(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setCounting(true);
    const timer = setTimeout(() => {
      emailPortalService
        .previewAudience(audience)
        .then((result) => {
          if (cancelled) return;
          setTotal(result.total);
          onTotalChange?.(result.total);
        })
        .catch(() => {
          if (cancelled) return;
          setTotal(null);
          onTotalChange?.(null);
        })
        .finally(() => !cancelled && setCounting(false));
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const listAudience: Audience = isPickMode ? emptyAudience() : { ...audience, excludeUserIds: [] };
  const listKey = JSON.stringify(listAudience);

  useEffect(() => {
    setPage(1);
  }, [listKey]);

  useEffect(() => {
    let cancelled = false;
    setLoadingUsers(true);
    const timer = setTimeout(() => {
      emailPortalService
        .audienceUsers(listAudience, { search: debouncedSearch, page, limit: 10 })
        .then((result) => {
          if (cancelled) return;
          setUsers(result.users);
          setUsersPage({ page: result.page, totalPages: result.totalPages, total: result.total });
        })
        .catch(() => !cancelled && setUsers([]))
        .finally(() => !cancelled && setLoadingUsers(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey, debouncedSearch, page]);

  useEffect(() => {
    const missing = audience.userIds.filter((id) => !pickedUsers[id]);
    if (!missing.length) return;
    emailPortalService
      .audienceUsers({ ...emptyAudience(), mode: 'selected', userIds: missing }, { limit: 100 })
      .then((result) => setPickedUsers((current) => ({ ...current, ...Object.fromEntries(result.users.map((u) => [u.id, u])) })))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience.userIds]);

  const setFilters = (patch: Partial<AudienceFilters>) => onChange({ ...audience, filters: { ...filters, ...patch } });

  const toggleId = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const toggleExclude = (user: AudienceUser) =>
    onChange({
      ...audience,
      excludeUserIds: audience.excludeUserIds.includes(user.id)
        ? audience.excludeUserIds.filter((id) => id !== user.id)
        : [...audience.excludeUserIds, user.id],
    });

  const togglePick = (user: AudienceUser) => {
    setPickedUsers((current) => ({ ...current, [user.id]: user }));
    onChange({
      ...audience,
      userIds: audience.userIds.includes(user.id) ? audience.userIds.filter((id) => id !== user.id) : [...audience.userIds, user.id],
    });
  };

  const classOptions: PickerOption[] = (options?.liveClasses ?? []).map((c) => ({
    id: c.id,
    label: c.title,
    meta: `${c.startTime ? formatDate(c.startTime) : 'No date'} · ${formatNumber(c.attendees)} joined`,
  }));
  const seriesOptions: PickerOption[] = (options?.liveSeries ?? []).map((s) => ({
    id: s.id,
    label: s.title,
    meta: `${s.startDate ? formatDate(s.startDate) : 'No date'} · ${formatNumber(s.enrolled)} enrolled`,
  }));

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl border border-zinc-800 bg-zinc-950 p-0.5">
        {[
          { label: 'Filter users', value: 'filters' as const },
          { label: 'Hand-pick users', value: 'selected' as const },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange({ ...audience, mode: tab.value })}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              audience.mode === tab.value ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!isPickMode && (
        <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4 sm:p-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-200">When they signed up</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFilters({ signup: { preset: preset.value, from: filters.signup.from, to: filters.signup.to } })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filters.signup.preset === preset.value ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {filters.signup.preset === 'custom' && (
              <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
                <label className="text-xs text-zinc-500">
                  From
                  <input
                    type="date"
                    value={filters.signup.from ?? ''}
                    onChange={(e) => setFilters({ signup: { ...filters.signup, from: e.target.value || null } })}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="text-xs text-zinc-500">
                  To
                  <input
                    type="date"
                    value={filters.signup.to ?? ''}
                    onChange={(e) => setFilters({ signup: { ...filters.signup, to: e.target.value || null } })}
                    className={`${inputClass} mt-1`}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <MultiPicker
              title="Joined a live class"
              hint="People who registered for or joined any selected class."
              options={classOptions}
              selected={filters.liveClassIds}
              onToggle={(id) => setFilters({ liveClassIds: toggleId(filters.liveClassIds, id) })}
              emptyText={options ? 'No classes found' : 'Loading classes…'}
            />
            <MultiPicker
              title="Enrolled in a live series"
              hint="People who bought or reserved a spot in any selected series."
              options={seriesOptions}
              selected={filters.liveSeriesIds}
              onToggle={(id) => setFilters({ liveSeriesIds: toggleId(filters.liveSeriesIds, id) })}
              emptyText={options ? 'No series found' : 'Loading series…'}
            />
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-5">
            <TriToggle label="Has bought something" value={filters.purchased} onChange={(value) => setFilters({ purchased: value })} />
            <TriToggle label="Has joined any live class" value={filters.joinedLiveClass} onChange={(value) => setFilters({ joinedLiveClass: value })} />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={filters.includeAdmins}
              onChange={(e) => setFilters({ includeAdmins: e.target.checked })}
              className="h-4 w-4 accent-violet-600"
            />
            Include Hallos staff (admin accounts)
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-500/30 bg-violet-600/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-violet-600/20 p-2 text-violet-300">
            <Users size={18} />
          </span>
          <div>
            <p className="text-2xl font-bold leading-none text-zinc-100">{total === null ? '—' : formatNumber(total)}</p>
            <p className="mt-1 text-xs text-zinc-400">{counting ? 'Updating…' : 'people will receive this email'}</p>
          </div>
        </div>
        {options && options.totals.unsubscribed > 0 && (
          <p className="text-xs text-zinc-500">{formatNumber(options.totals.unsubscribed)} unsubscribed users are always excluded</p>
        )}
      </div>

      {isPickMode && audience.userIds.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-500">Selected ({audience.userIds.length})</p>
          <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
            {audience.userIds.map((id) => {
              const user = pickedUsers[id];
              return (
                <span key={id} className="flex items-center gap-1 rounded-full bg-violet-600/20 py-1 pl-3 pr-1.5 text-xs font-semibold text-violet-200">
                  {user ? `${user.firstName} ${user.lastName}`.trim() || user.email : `User #${id}`}
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => onChange({ ...audience, userIds: audience.userIds.filter((x) => x !== id) })}
                    className="rounded-full p-0.5 hover:bg-violet-500/30"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-800">
        <div className="flex flex-col gap-2 border-b border-zinc-800 bg-zinc-950/40 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">{isPickMode ? 'Find people to add' : 'Who is in this audience'}</p>
            <p className="text-xs text-zinc-500">
              {isPickMode ? 'Tick the people who should receive this email.' : 'Untick anyone you want to leave out.'}
            </p>
          </div>
          <div className="relative w-full sm:w-60">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" className={`${inputClass} py-2 pl-9`} />
          </div>
        </div>

        {loadingUsers && users.length === 0 ? (
          <Spinner label="Loading people…" />
        ) : users.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">No one matches.</p>
        ) : (
          <ul className="divide-y divide-zinc-800/70">
            {users.map((user) => {
              const checked = isPickMode ? audience.userIds.includes(user.id) : !audience.excludeUserIds.includes(user.id);
              return (
                <li key={user.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/40">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => (isPickMode ? togglePick(user) : toggleExclude(user))}
                      className="h-4 w-4 accent-violet-600"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-200">
                        {`${user.firstName} ${user.lastName}`.trim() || 'Unnamed user'}
                      </span>
                      <span className="block truncate text-xs text-zinc-500">{user.email}</span>
                    </span>
                    <span className="hidden text-xs text-zinc-600 sm:block">Joined {formatDate(user.createdAt)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-950/40 px-4 py-2.5">
          <span className="text-xs text-zinc-500">
            {formatNumber(usersPage.total)} {isPickMode ? 'users' : 'matching'}
            {!isPickMode && audience.excludeUserIds.length > 0 && (
              <button type="button" onClick={() => onChange({ ...audience, excludeUserIds: [] })} className="ml-3 font-semibold text-violet-400 hover:underline">
                Restore {audience.excludeUserIds.length} left out
              </button>
            )}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              {usersPage.page} / {usersPage.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={usersPage.page <= 1}
              aria-label="Previous page"
              className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, usersPage.totalPages))}
              disabled={usersPage.page >= usersPage.totalPages}
              aria-label="Next page"
              className="rounded-lg bg-zinc-800 p-1.5 text-zinc-400 hover:text-white disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
