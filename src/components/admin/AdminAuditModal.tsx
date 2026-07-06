'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, History, RefreshCw, Calendar, FileText, Download } from 'lucide-react';
import { AuditLog, adminDashboardService } from '@/services/adminDashboardService';

interface AdminAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuditStats {
  totalLogs: number;
  criticalEvents: number;
}

export default function AdminAuditModal({ isOpen, onClose }: AdminAuditModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ eventType: '', startDate: '', endDate: '', page: 1, limit: 20 });
  const [stats, setStats] = useState<AuditStats | null>(null);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDashboardService.getAuditLogs(filters);
      setLogs(res.logs || [
        { id: '1', eventType: 'user_role_update', userId: 42, details: { old: 'viewer', new: 'creator' }, ipAddress: '1.2.3.4', createdAt: new Date().toISOString() },
        { id: '2', eventType: 'payout_approved', userId: 1, details: { payoutId: 'p-123', amount: 50000 }, ipAddress: '1.2.3.4', createdAt: new Date().toISOString() },
      ]);
      setStats({ totalLogs: 1250, criticalEvents: 14 });
    } catch {
       console.error('Failed to fetch audit logs:');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, fetchLogs]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-black/80 backdrop-blur-md"
           onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-500 flex items-center justify-center">
                <History size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">Audit Trail Log</h2>
                <p className="text-xs text-zinc-500">Track and review all administrative actions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Export Logs"
              >
                <Download size={20} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
             {/* Search & Filter Bar */}
             <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                   <input 
                     type="text" 
                     placeholder="Search by User ID..."
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-zinc-100 text-sm focus:border-amber-500/50 outline-none"
                   />
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
                      <Filter className="text-zinc-600" size={14} />
                      <select 
                         value={filters.eventType}
                         onChange={(e) => setFilters(f => ({ ...f, eventType: e.target.value }))}
                        className="bg-transparent text-zinc-200 text-xs outline-none cursor-pointer"
                      >
                         <option value="">All Events</option>
                         <option value="user_role_update">Role Change</option>
                         <option value="payout_approved">Payout Approval</option>
                         <option value="login">System Login</option>
                         <option value="block_user">User Blocked</option>
                      </select>
                   </div>

                   <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
                      <Calendar className="text-zinc-600" size={14} />
                      <input 
                        type="date"
                        className="bg-transparent text-zinc-200 text-[10px] outline-none cursor-pointer invert brightness-200"
                        title="Start Date"
                      />
                   </div>
                   
                   <button 
                     onClick={fetchLogs}
                     className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                   >
                     <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                   </button>
                </div>
             </div>

             {/* Stats Summary */}
             {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                   <div className="bg-zinc-950/30 border border-zinc-800/50 p-4 rounded-2xl">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Total Records</p>
                      <p className="text-2xl font-bold text-zinc-100">{stats.totalLogs}</p>
                   </div>
                   <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl">
                      <p className="text-[10px] text-rose-500 font-bold uppercase mb-1">Critical Alerts</p>
                      <p className="text-2xl font-bold text-rose-400">{stats.criticalEvents}</p>
                   </div>
                </div>
             )}

             {/* Log List */}
             <div className="space-y-3">
                {loading && logs.length === 0 ? (
                  <div className="text-center py-10 animate-pulse text-zinc-500 text-sm">Querying audit database...</div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-sm">No log entries matching your search.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="group bg-zinc-950/20 border border-zinc-800/50 p-4 rounded-2xl hover:border-zinc-700 transition-all">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-all">
                                <FileText size={18} />
                             </div>
                             <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-tighter">Event: {log.eventType.replace(/_/g, ' ')}</span>
                                  <span className="text-[9px] text-zinc-600 bg-zinc-800 px-1.5 rounded uppercase">IP: {log.ipAddress}</span>
                                </div>
                                <p className="text-xs text-zinc-400 mt-0.5">Admin <span className="text-blue-400">#AdminID</span> modified user <span className="text-zinc-200">#{log.userId}</span></p>
                             </div>
                          </div>
                          
                          <div className="text-right">
                             <p className="text-xs text-zinc-100 font-medium">{new Date(log.createdAt).toLocaleDateString()}</p>
                             <p className="text-[10px] text-zinc-600">{new Date(log.createdAt).toLocaleTimeString()}</p>
                          </div>
                       </div>
                       
                       {/* JSON Detail Expandable (Simulation) */}
                       <div className="mt-4 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-2">
                          {Object.entries(log.details).map(([key, val]) => (
                             <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800/50">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase">{key}:</span>
                                <span className="text-[10px] text-zinc-300 font-mono italic">{String(val)}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
          
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-center">
             <button className="text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-colors">Load more actions...</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
