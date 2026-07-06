'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  getAdminDigestQueue, 
  type DigestQueueItem 
} from '@/lib/api/notification';
import { 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  User
} from 'lucide-react';

export function DigestQueueTable() {
  const [status, setStatus] = useState<'pending' | 'sent' | 'skipped'>('pending');
  const [items, setItems] = useState<DigestQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminDigestQueue({ status, page, limit });
      if (response.success) {
        setItems(Array.isArray(response.data) ? response.data : []);
        setTotal(response.total || 0);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'sent', label: 'Sent' },
    { id: 'skipped', label: 'Skipped' },
  ];

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-zinc-800/50 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatus(tab.id as 'pending' | 'sent' | 'skipped');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                status === tab.id 
                  ? 'bg-zinc-700 text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button 
          onClick={fetchItems}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">User ID</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Scheduled For</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-zinc-800 rounded w-full"></div></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-600 font-sans italic">
                  No {status} digests found in the queue.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <User size={14} className="text-zinc-600" />
                      <span>USR-{item.userId.toString().padStart(4, '0')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase tracking-tighter ${
                      item.type === 'daily' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">
                    {new Date(item.scheduledFor).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                      item.status === 'pending' ? 'text-amber-500' : 
                      item.status === 'sent' ? 'text-emerald-500' : 
                      'text-zinc-500'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'pending' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                        item.status === 'sent' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                        'bg-zinc-500'
                      }`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-zinc-600 text-[10px]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-white/5 flex items-center justify-between">
        <p className="text-xs text-zinc-500">
          Showing {Math.min(items.length, limit)} of {total} results
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-lg border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            disabled={page * limit >= total || loading}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-lg border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
