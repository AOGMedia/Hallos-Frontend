'use client';

import React, { useState } from 'react';
import { 
  triggerAdminDigest, 
  type TriggerDigestResponse 
} from '@/lib/api/notification';
import { AdminConfirmModal } from './AdminConfirmModal';
import { 
  Play, 
  AlertOctagon, 
  XCircle,
} from 'lucide-react';

export function ManualTriggerPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<'daily' | 'weekly' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<TriggerDigestResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTriggerClick = (type: 'daily' | 'weekly') => {
    setTriggerType(type);
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!triggerType) return;
    
    setIsLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const response = await triggerAdminDigest(triggerType);
      if (response.success) {
        setLastResult(response.data);
      } else {
        setError(response.message || 'Trigger failed');
      }
    } catch (err: unknown) {
      console.error('Trigger error:', err);
      setError('A server error occurred while triggering the digest.');
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-rose-500/5 border border-rose-500/10 rounded-[32px] p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <AlertOctagon size={120} />
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Play size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white italic tracking-tight uppercase">Manual Run</h3>
              <p className="text-sm text-zinc-500">Bypass schedules and force-trigger a digest campaign.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleTriggerClick('daily')}
              disabled={isLoading}
              className="group flex flex-col gap-2 p-6 rounded-2xl bg-zinc-900 border border-white/5 text-left hover:border-rose-500/30 transition-all"
            >
              <span className="text-xs font-bold text-zinc-600 uppercase group-hover:text-rose-400">Daily Digest</span>
              <span className="text-sm font-semibold text-zinc-300">Trigger standard 24h summary</span>
            </button>
            <button
              onClick={() => handleTriggerClick('weekly')}
              disabled={isLoading}
              className="group flex flex-col gap-2 p-6 rounded-2xl bg-zinc-900 border border-white/5 text-left hover:border-rose-500/30 transition-all"
            >
              <span className="text-xs font-bold text-zinc-600 uppercase group-hover:text-rose-400">Weekly Digest</span>
              <span className="text-sm font-semibold text-zinc-300">Force compile Monday newsletter</span>
            </button>
          </div>
        </div>

        {/* Result Summary */}
        {lastResult && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase">Processed</p>
              <p className="text-xl font-black text-white mt-1">{lastResult.usersProcessed}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <p className="text-[10px] font-bold text-emerald-500 uppercase">Sent</p>
              <p className="text-xl font-black text-white mt-1">{lastResult.emailsSent}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-[10px] font-bold text-amber-500 uppercase">Skipped</p>
              <p className="text-xl font-black text-white mt-1">{lastResult.emailsSkipped}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <p className="text-[10px] font-bold text-rose-500 uppercase">Failed</p>
              <p className="text-xl font-black text-white mt-1">{lastResult.failed}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
            <XCircle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      <AdminConfirmModal
        isOpen={isModalOpen}
        title={`Trigger ${triggerType} digest?`}
        description={`This will immediately start processing and sending emails to all users subscribed to ${triggerType} digests. This action cannot be undone.`}
        confirmLabel="Execute Now"
        variant="danger"
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
