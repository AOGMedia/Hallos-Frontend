'use client';

import React, { useEffect, useCallback, useTransition } from 'react';
import { Plus, Trophy, Calendar, Users, DollarSign, PlayCircle, XCircle } from 'lucide-react';
import { quizAdminService, QuizTournament } from '@/services/quizAdminService';
import { useQuizTournamentsStore } from '@/store/quizTournamentsStore';
import dynamic from 'next/dynamic';

const TournamentFormModal = dynamic(() => import('@/components/admin/quiz/TournamentFormModal'), { ssr: false });

export default function QuizTournamentsTab() {
  const {
    tournaments,
    loading,
    isModalOpen,
    editingTournament,
    setTournaments,
    setLoading,
    setIsModalOpen,
    setEditingTournament,
  } = useQuizTournamentsStore();

  const [, startTransition] = useTransition();

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setTournaments([]);
    } catch (err) {
      console.error('Failed to fetch tournaments', err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setTournaments]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleStart = async (id: string) => {
    if (!confirm('Are you sure you want to officially start this tournament?')) return;
    startTransition(async () => {
      try {
        const res = await quizAdminService.startTournament(id);
        if (res.success) {
          alert(res.message);
          fetchTournaments();
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        alert(e.response?.data?.message || e.message);
      }
    });
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Enter a reason for cancellation (Required for refunds):');
    if (!reason) return;
    startTransition(async () => {
      try {
        const res = await quizAdminService.cancelTournament(id, reason);
        if (res.success) {
          alert(`Cancelled successfully. ${res.refundCount} refunds processed totalling ₦${res.totalRefunded}.`);
          fetchTournaments();
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        alert(e.response?.data?.message || e.message);
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs font-medium border border-emerald-500/20">Registrations Open</span>;
      case 'active': return <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-medium border border-blue-500/20">Active</span>;
      case 'completed': return <span className="bg-zinc-500/10 text-zinc-400 px-2 py-1 rounded text-xs font-medium border border-zinc-500/20">Completed</span>;
      case 'cancelled': return <span className="bg-rose-500/10 text-rose-400 px-2 py-1 rounded text-xs font-medium border border-rose-500/20">Cancelled</span>;
      default: return <span className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded text-xs font-medium">{status.toUpperCase()}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Trophy className="text-blue-400" size={24} />
          <div>
            <h2 className="text-zinc-100 font-bold">Manage Tournaments</h2>
            <p className="text-sm text-zinc-400">Create events and orchestrate prize pools.</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingTournament(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} /> New Tournament
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-xs uppercase text-zinc-500 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4">Tournament Event</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Prize Pool / Fee</th>
                <th className="px-6 py-4">Participants</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : tournaments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-zinc-500">
                    <Trophy className="mx-auto mb-3 opacity-30" size={32} />
                    <p>No tournaments exist yet.</p>
                    <button
                      onClick={() => { setEditingTournament(null); setIsModalOpen(true); }}
                      className="mt-4 text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      Create the first one
                    </button>
                  </td>
                </tr>
              ) : (
                tournaments.map((t: QuizTournament) => (
                  <tr key={t.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-300">{t.name}</td>
                    <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium"><DollarSign size={14} /> ₦{t.prizePool?.toLocaleString()}</span>
                        {t.entryFee && <span className="text-xs text-zinc-500">Entry: ₦{t.entryFee.toLocaleString()}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 font-mono text-zinc-300">
                        <Users size={14} className="text-zinc-500" />
                        {t.minParticipants || 0} / {t.maxParticipants || '∞'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-500">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar size={12} /> {t.startTime ? new Date(t.startTime).toLocaleDateString() : 'TBD'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status === 'open' && (
                          <>
                            <button
                              onClick={() => handleStart(t.id)}
                              title="Start Tournament officially"
                              className="p-1.5 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            >
                              <PlayCircle size={16} />
                            </button>
                            <button
                              onClick={() => { setEditingTournament(t); setIsModalOpen(true); }}
                              className="font-medium text-blue-400 hover:text-blue-300 transition-colors mr-2 px-2 py-1 bg-blue-500/10 rounded"
                            >
                              Edit
                            </button>
                          </>
                        )}
                        {(t.status === 'open' || t.status === 'active') && (
                          <button
                            onClick={() => handleCancel(t.id)}
                            title="Cancel Tournament"
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TournamentFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); fetchTournaments(); }}
        tournament={editingTournament}
      />
    </div>
  );
}
