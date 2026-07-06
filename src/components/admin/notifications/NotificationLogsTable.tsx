'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAdminNotificationLogs, 
  type NotificationLog 
} from '@/lib/api/notification';
import { 
  Filter, 
  X, 
  ArrowRight,
  Clock,
  User,
  History
} from 'lucide-react';

export function NotificationLogsTable() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminNotificationLogs({ 
        userId: userId ? parseInt(userId) : undefined,
        notificationType: type || undefined,
        page,
        limit 
      });
      if (response.success) {
        setLogs(Array.isArray(response.data) ? response.data : []);
        setTotal(response.total || 0);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, type, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Search User ID</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 1234"
              className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Notification Type</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3 pl-10 pr-10 text-sm text-zinc-300 focus:outline-none focus:border-primary/50 appearance-none transition-colors"
            >
              <option value="">All Types</option>
              <option value="daily_digest">Daily Digest</option>
              <option value="weekly_digest">Weekly Digest</option>
              <option value="live_class">Live Class Alert</option>
            </select>
          </div>
        </div>
        <button 
          onClick={() => { setUserId(''); setType(''); setPage(1); }}
          className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl transition-colors"
          title="Reset Filters"
        >
          <X size={20} />
        </button>
      </div>

      {/* Logs Card */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <History size={18} className="text-primary" />
          <h3 className="text-base font-semibold text-white italic tracking-tight">Delivery History</h3>
        </div>
        
        <div className="divide-y divide-white/5">
          {loading && logs.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 animate-pulse flex items-center justify-between">
                <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
              </div>
            ))
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-zinc-600 italic">No logs matching your filters.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-white/[0.01] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${
                    log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                    log.status === 'skipped' ? 'bg-zinc-500/10 text-zinc-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    <ArrowRight size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200">
                      USR-{log.userId.toString().padStart(4, '0')} 
                      <span className="mx-2 text-zinc-700">•</span>
                      <span className="text-zinc-500 font-normal">{log.type.replace('_', ' ')}</span>
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5 flex items-center gap-1 font-mono uppercase">
                      <Clock size={10} /> {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   {log.error && (
                     <p className="text-[10px] text-rose-400 max-w-[200px] truncate italic" title={log.error}>
                       {log.error}
                     </p>
                   )}
                   <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${
                    log.status === 'success' ? 'border-emerald-500/20 text-emerald-500' : 
                    log.status === 'skipped' ? 'border-white/10 text-zinc-500' : 'border-rose-500/20 text-rose-500'
                   }`}>
                     {log.status}
                   </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Minimal Pagination */}
        {total > limit && (
          <div className="p-4 bg-black/20 flex items-center justify-center gap-4">
            <button 
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="text-xs font-bold text-zinc-500 hover:text-white disabled:opacity-20 uppercase tracking-widest transition-colors"
            >
              Previous
            </button>
            <span className="text-[10px] font-mono text-zinc-700">{page} / {Math.ceil(total / limit)}</span>
            <button 
              disabled={page * limit >= total || loading}
              onClick={() => setPage(p => p + 1)}
              className="text-xs font-bold text-zinc-500 hover:text-white disabled:opacity-20 uppercase tracking-widest transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
