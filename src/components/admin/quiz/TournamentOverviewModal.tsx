'use client';

import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { X, Activity, AlertTriangle, Swords } from 'lucide-react';
import { quizAdminService, TournamentOverviewResponse } from '@/services/quizAdminService';

interface TournamentOverviewModalProps {
  tournamentId: string | null;
  onClose: () => void;
  onFinalized?: () => void;
}

const ROUND_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  active: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

/**
 * Live monitoring for an in-progress tournament — round and match state, plus
 * the force-finalize override for a round that has wedged. Without this the
 * overview and force-finalize endpoints had no caller, so a stuck tournament
 * could only be resolved directly against the database.
 */
export default function TournamentOverviewModal({
  tournamentId,
  onClose,
  onFinalized,
}: TournamentOverviewModalProps) {
  const [data, setData] = useState<TournamentOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchOverview = useCallback(async () => {
    if (!tournamentId) return;
    try {
      setLoading(true);
      setError(null);
      setData(await quizAdminService.getTournamentOverview(tournamentId));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e.response?.data?.message || e.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Refresh while a tournament is actually running so a wedged round shows up
  // without the admin having to reopen the modal.
  useEffect(() => {
    if (!tournamentId || data?.tournament.status !== 'in_progress') return;
    const id = setInterval(fetchOverview, 15_000);
    return () => clearInterval(id);
  }, [tournamentId, data?.tournament.status, fetchOverview]);

  const handleForceFinalize = () => {
    if (!tournamentId || !data) return;
    if (!confirm(
      `Force-finalize "${data.tournament.name}"?\n\nPrizes are paid out immediately from the current standings. This cannot be undone.`
    )) return;

    startTransition(async () => {
      try {
        await quizAdminService.forceFinalizeTournament(tournamentId);
        await fetchOverview();
        onFinalized?.();
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        alert(e.response?.data?.message || e.message);
      }
    });
  };

  if (!tournamentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Activity className="text-blue-400 flex-shrink-0" size={20} />
            <div className="min-w-0">
              <h3 className="text-zinc-100 font-bold text-sm truncate">
                {data?.tournament.name ?? 'Tournament overview'}
              </h3>
              <p className="text-xs text-zinc-500">
                {data
                  ? `${data.tournament.status} · round ${data.tournament.currentRound ?? 0}/${data.tournament.totalRounds ?? '?'}`
                  : 'Loading…'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          {loading && !data ? (
            <div className="py-12 text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-rose-400">
              {error}
              <button onClick={fetchOverview} className="ml-2 underline hover:text-rose-300">Retry</button>
            </div>
          ) : data ? (
            <>
              {/* Participant status counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                  <p className="text-xs text-zinc-500">Entrants</p>
                  <p className="text-xl font-bold text-zinc-100">{data.participantCount}</p>
                </div>
                {(['active', 'eliminated', 'winner'] as const).map((key) => (
                  <div key={key} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                    <p className="text-xs text-zinc-500 capitalize">{key}</p>
                    <p className="text-xl font-bold text-zinc-100">{data.statusCounts[key] ?? 0}</p>
                  </div>
                ))}
              </div>

              {/* Rounds */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2">Rounds</h4>
                {data.rounds.length === 0 ? (
                  <p className="text-sm text-zinc-500">No rounds have started yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.rounds.map((r) => {
                      const answered = r.participants.filter(
                        (p) => p.bye || (p.answers?.length ?? 0) >= r.questions.length
                      ).length;
                      return (
                        <li key={r.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-zinc-200">Round {r.roundNumber}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${ROUND_STATUS_STYLES[r.status] ?? ''}`}>
                              {r.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 flex-wrap">
                            <span>{answered}/{r.participants.length} finished</span>
                            <span>{r.questions.length} questions</span>
                            {r.startedAt && <span>started {new Date(r.startedAt).toLocaleTimeString()}</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Knockout matches */}
              {data.matches.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-2 flex items-center gap-1.5">
                    <Swords size={12} /> Matches
                  </h4>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900/60 text-zinc-500 uppercase">
                        <tr>
                          <th className="px-3 py-2">Round</th>
                          <th className="px-3 py-2">Players</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Winner</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 text-zinc-400">
                        {data.matches.map((m) => (
                          <tr key={m.id}>
                            <td className="px-3 py-2">{m.roundNumber}</td>
                            <td className="px-3 py-2 font-mono">#{m.challengerId} v #{m.opponentId}</td>
                            <td className="px-3 py-2">{m.status}</td>
                            <td className="px-3 py-2 font-mono">
                              {m.winnerId ? `#${m.winnerId}` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Force finalize */}
              {data.tournament.status === 'in_progress' && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-amber-300">Force-finalize</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        For a tournament wedged on a round that will never complete. Pays prizes from the
                        current standings and closes it. Cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={handleForceFinalize}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
                    >
                      Finalize now
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
