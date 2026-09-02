'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, AlertCircle } from 'lucide-react';
import { quizAdminService, QuizTournament, QuizCategory, CreateTournamentData } from '@/services/quizAdminService';
import DateTimePicker from '@/components/admin/DateTimePicker';

interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: QuizTournament | null;
}

const FORMATS: { id: NonNullable<QuizTournament['format']>; label: string; blurb: string }[] = [
  { id: 'classic',       label: 'Classic',       blurb: 'Everyone answers the same set; highest score wins' },
  { id: 'speed_run',     label: 'Speed Run',     blurb: 'Ranked by fastest correct completion' },
  { id: 'knockout',      label: 'Knockout',      blurb: 'Head-to-head pairings, losers eliminated' },
  { id: 'battle_royale', label: 'Battle Royale', blurb: 'Bottom 25% eliminated each round' },
];

const ENTRY_FEE_PRESETS = [0, 50, 100, 250, 500];

// Knockout/battle_royale round counts are derived from the final registered
// headcount when the tournament starts, so there's no input for them here.
// classic/speed_run have no elimination mechanic to derive a count from, so
// the organizer sets it directly, same as entry fee/player caps/prize split.
// Bounds/default must match tournamentService.js's MIN/MAX/DEFAULT_TOURNAMENT_ROUNDS.
const CONFIGURABLE_ROUNDS_FORMATS: NonNullable<QuizTournament['format']>[] = ['classic', 'speed_run'];
const DEFAULT_ROUNDS = 3;
const MIN_ROUNDS = 1;
const MAX_ROUNDS = 10;

/** Numeric field that clamps on blur, not on every keystroke */
function NumberField({
  label, value, onCommit, min, max, suffix, hint, disabled,
}: {
  label: string;
  value: number;
  onCommit: (n: number) => void;
  min: number;
  max?: number;
  suffix?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => { if (!focused) setDraft(String(value)); }, [value, focused]);

  const commit = () => {
    setFocused(false);
    const parsed = Number(draft);
    if (draft.trim() === '' || Number.isNaN(parsed)) { setDraft(String(value)); return; }
    let next = Math.floor(parsed);
    if (next < min) next = min;
    if (max != null && next > max) next = max;
    setDraft(String(next));
    onCommit(next);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={draft}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
          className={`w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 ${suffix ? 'pr-11' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-zinc-500">{hint}</p>}
    </div>
  );
}

export default function TournamentFormModal({ isOpen, onClose, tournament }: TournamentFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [format, setFormat] = useState<NonNullable<QuizTournament['format']>>('classic');

  const [entryFee, setEntryFee] = useState(100);
  const [maxParticipants, setMaxParticipants] = useState(64);
  const [minParticipants, setMinParticipants] = useState(8);
  const [totalRounds, setTotalRounds] = useState(DEFAULT_ROUNDS);
  const [registrationDeadline, setRegistrationDeadline] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState<Date | undefined>();

  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Registration must close far enough out to leave a real window to sign up.
  const [earliestDeadline] = useState(() => new Date(Date.now() + 30 * 60_000));
  const earliestStart = registrationDeadline
    ? new Date(registrationDeadline.getTime() + 15 * 60_000)
    : earliestDeadline;

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await quizAdminService.getCategories();
      setCategories(res.categories ?? []);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchCategories();

    if (tournament) {
      setName(tournament.name);
      setDescription(tournament.description ?? '');
      setFormat(tournament.format ?? 'classic');
      setEntryFee(tournament.entryFee || 0);
      setMaxParticipants(tournament.maxParticipants || 64);
      setMinParticipants(tournament.minParticipants || 8);
      setRegistrationDeadline(tournament.registrationDeadline ? new Date(tournament.registrationDeadline) : undefined);
      setStartTime(tournament.startTime ? new Date(tournament.startTime) : undefined);
    } else {
      setName('');
      setDescription('');
      setCategoryId('');
      setFormat('classic');
      setEntryFee(100);
      setMaxParticipants(64);
      setMinParticipants(8);
      setTotalRounds(DEFAULT_ROUNDS);
      setRegistrationDeadline(undefined);
      setStartTime(undefined);
    }
    setError(null);
  }, [isOpen, tournament, fetchCategories]);

  const deadlineError =
    registrationDeadline && registrationDeadline <= new Date() ? 'Must be in the future' : null;
  const startError =
    startTime && registrationDeadline && startTime <= registrationDeadline
      ? 'Must be after registration closes'
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournament) {
      if (!categoryId) { setError('Pick a question category'); return; }
      if (!registrationDeadline) { setError('Set when registration closes'); return; }
      if (!startTime) { setError('Set when the tournament starts'); return; }
      if (startTime <= registrationDeadline) { setError('Start time must be after registration closes'); return; }
      if (maxParticipants < minParticipants) { setError('Max participants cannot be below the minimum'); return; }
    }

    startTransition(async () => {
      setError(null);
      try {
        if (tournament) {
          const res = await quizAdminService.updateTournament(tournament.id, {
            name, entryFee: Number(entryFee), maxParticipants: Number(maxParticipants),
          });
          if (res.success) onClose();
        } else {
          const payload: CreateTournamentData = {
            name,
            description,
            categoryId,
            entryFee: Number(entryFee),
            maxParticipants: Number(maxParticipants),
            minParticipants: Number(minParticipants),
            registrationDeadline: registrationDeadline!.toISOString(),
            startTime: startTime!.toISOString(),
            format,
            prizeDistribution: { first: 60, second: 30, third: 10 },
            // Ignored by the backend for knockout/battle_royale (their round
            // count is computed from the final headcount at start time), so
            // it's fine to always send the current value regardless of format.
            totalRounds,
          };
          const res = await quizAdminService.createTournament(payload);
          if (res.success) onClose();
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setError(e.response?.data?.message || e.message || 'Failed to process tournament.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#121212] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-zinc-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a] shrink-0">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Trophy size={20} className="text-indigo-400" /> {tournament ? 'Edit Tournament' : 'Create Tournament'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div className="p-6 overflow-y-auto scrollbar-hide">
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex gap-2"><AlertCircle size={16} className="shrink-0" /> {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tournament Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Friday Night Classic"
                  className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {!tournament && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What should players expect?"
                      className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Was a raw UUID text box — admins had to paste an id by hand */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Question Category</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        disabled={categoriesLoading}
                        required
                        className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      >
                        <option value="">{categoriesLoading ? 'Loading…' : 'Choose a category'}</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}{c.questionCount != null ? ` (${c.questionCount} questions)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Was hardcoded to 'knockout' on every admin-created tournament */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Format</label>
                      <select
                        value={format}
                        onChange={(e) => setFormat(e.target.value as NonNullable<QuizTournament['format']>)}
                        className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                      >
                        {FORMATS.map((f) => (
                          <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-zinc-500">
                        {FORMATS.find((f) => f.id === format)?.blurb}
                      </p>
                    </div>
                  </div>

                  {CONFIGURABLE_ROUNDS_FORMATS.includes(format) && (
                    <div className="max-w-[10rem]">
                      <NumberField
                        label="Rounds"
                        value={totalRounds}
                        onCommit={setTotalRounds}
                        min={MIN_ROUNDS}
                        max={MAX_ROUNDS}
                        hint={totalRounds === 1 ? 'Single round decides it' : 'Score accumulates across rounds'}
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <NumberField
                    label="Entry Fee"
                    value={entryFee}
                    onCommit={setEntryFee}
                    min={0}
                    suffix="MP"
                    hint={entryFee === 0 ? 'Free to enter' : `Pot ≥ ${(entryFee * minParticipants).toLocaleString()} MP`}
                  />
                  <NumberField
                    label="Min Participants"
                    value={minParticipants}
                    onCommit={(n) => {
                      setMinParticipants(n);
                      if (n > maxParticipants) setMaxParticipants(n);
                    }}
                    min={2}
                    hint="Auto-refunds below this"
                    disabled={!!tournament}
                  />
                  <NumberField
                    label="Max Participants"
                    value={maxParticipants}
                    onCommit={setMaxParticipants}
                    min={minParticipants}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] text-zinc-500 mr-0.5">Entry fee:</span>
                  {ENTRY_FEE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEntryFee(preset)}
                      className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                        entryFee === preset
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                      }`}
                    >
                      {preset === 0 ? 'Free' : `${preset} MP`}
                    </button>
                  ))}
                </div>
              </div>

              {!tournament && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Registration Deadline</label>
                    <DateTimePicker
                      value={registrationDeadline}
                      onChange={(d) => {
                        setRegistrationDeadline(d);
                        // Don't leave a start time stranded before the new deadline
                        if (d && startTime && startTime <= d) setStartTime(undefined);
                      }}
                      min={earliestDeadline}
                      placeholder="Pick a closing time"
                      error={deadlineError}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Start Time</label>
                    <DateTimePicker
                      value={startTime}
                      onChange={setStartTime}
                      min={earliestStart}
                      placeholder={registrationDeadline ? 'Pick a start time' : 'Set the deadline first'}
                      error={startError}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-zinc-800 mt-6 pt-4 shrink-0">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isPending} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-md transition-colors">
                  {isPending ? 'Saving...' : (tournament ? 'Save Changes' : 'Create Tournament')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
