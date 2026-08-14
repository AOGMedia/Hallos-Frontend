'use client';

import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { Inbox, Check, X, Calendar, Users, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { quizAdminService, QuizTournament } from '@/services/quizAdminService';

const FORMAT_LABELS: Record<string, string> = {
  classic: 'Classic',
  speed_run: 'Speed Run',
  knockout: 'Knockout',
  battle_royale: 'Battle Royale',
};

/**
 * Review queue for user-hosted tournament proposals.
 *
 * Players can propose tournaments from the quiz app, which land in
 * `pending_review`. Until this panel existed nothing could move them out of
 * that state — proposals accumulated silently and the
 * `tournament_proposal_approved` / `_rejected` events the quiz app listens for
 * could never fire.
 */
export default function TournamentProposalsPanel({ onReviewed }: { onReviewed?: () => void }) {
  const [proposals, setProposals] = useState<QuizTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await quizAdminService.getTournamentProposals();
      setProposals(res.proposals ?? []);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleApprove = (id: string, name: string) => {
    if (!confirm(`Approve "${name}"? It opens for registration immediately and the proposer is notified.`)) return;
    setBusyId(id);
    startTransition(async () => {
      try {
        await quizAdminService.approveTournamentProposal(id);
        await fetchProposals();
        onReviewed?.();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        alert(e.response?.data?.message || e.message);
      } finally {
        setBusyId(null);
      }
    });
  };

  const handleReject = (id: string) => {
    const reason = rejectReason.trim();
    if (!reason) return;
    setBusyId(id);
    startTransition(async () => {
      try {
        await quizAdminService.rejectTournamentProposal(id, reason);
        setRejectingId(null);
        setRejectReason('');
        await fetchProposals();
        onReviewed?.();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        alert(e.response?.data?.message || e.message);
      } finally {
        setBusyId(null);
      }
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Inbox className="text-amber-400" size={20} />
          <div>
            <h3 className="text-zinc-100 font-bold text-sm">Proposals Awaiting Review</h3>
            <p className="text-xs text-zinc-500">Tournaments players have proposed from the quiz app.</p>
          </div>
        </div>
        {proposals.length > 0 && (
          <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-500/20">
            {proposals.length} pending
          </span>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : error ? (
        <div className="py-10 text-center text-sm text-rose-400">
          {error}
          <button onClick={fetchProposals} className="ml-2 underline hover:text-rose-300">Retry</button>
        </div>
      ) : proposals.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">
          <Inbox className="mx-auto mb-3 opacity-30" size={28} />
          <p className="text-sm">No proposals waiting. You&apos;re all caught up.</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {proposals.map((p) => {
            const isExpanded = expandedId === p.id;
            const isRejecting = rejectingId === p.id;
            const isBusy = busyId === p.id;

            return (
              <li key={p.id} className="p-4 hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-zinc-200">{p.name}</span>
                      {p.format && (
                        <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-xs">
                          {FORMAT_LABELS[p.format] ?? p.format}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <DollarSign size={12} /> Entry {p.entryFee?.toLocaleString() ?? 0} MP
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {p.minParticipants ?? 2}–{p.maxParticipants ?? '∞'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {p.startTime ? new Date(p.startTime).toLocaleString() : 'TBD'}
                      </span>
                      {p.proposedBy != null && <span>by user #{p.proposedBy}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
                      title="Details"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                      onClick={() => handleApprove(p.id, p.name)}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => { setRejectingId(isRejecting ? null : p.id); setRejectReason(''); }}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 disabled:opacity-50 text-zinc-300 text-xs font-medium rounded-lg transition-colors"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-400 space-y-1">
                    {p.description && <p className="text-zinc-300">{p.description}</p>}
                    <p>
                      Registration closes:{' '}
                      {p.registrationDeadline ? new Date(p.registrationDeadline).toLocaleString() : '—'}
                    </p>
                    <p>Prize pool so far: {p.prizePool?.toLocaleString() ?? 0} MP</p>
                    <p>Proposed: {new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                )}

                {isRejecting && (
                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <label className="block text-xs text-zinc-400 mb-1.5">
                      Reason for declining — shown to the proposer in the quiz app
                    </label>
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleReject(p.id); }}
                        placeholder="e.g. Entry fee is too high for a first-time host"
                        className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleReject(p.id)}
                        disabled={!rejectReason.trim() || isBusy}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Confirm decline
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
