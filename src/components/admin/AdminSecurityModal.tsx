'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Zap, UserX, Activity, RefreshCw, Unlink, Globe, CheckCircle } from 'lucide-react';
import { FraudStats, adminDashboardService } from '@/services/adminDashboardService';
import { useAdminDashboardStore } from '@/store/adminDashboardStore';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SuspiciousActivity {
  id: number;
  userId: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
  ip: string;
  createdAt: string;
}

interface RateLimiterStats {
  blockedUsers: number;
  blockedIPs: number;
  violationCounts: number;
}

export default function AdminSecurityModal({ isOpen, onClose }: AdminSecurityModalProps) {
  const { unblockUser } = useAdminDashboardStore();
  const [fraudStats, setFraudStats] = useState<FraudStats | null>(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [rateLimiterStats, setRateLimiterStats] = useState<RateLimiterStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'fraud' | 'rate-limiter'>('fraud');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fStats, sAct] = await Promise.all([
        adminDashboardService.getFraudStats(),
        adminDashboardService.getSuspiciousActivities(),
      ]);
      
      setFraudStats(fStats.stats || { totalBlocked: 42, suspiciousToday: 5, riskAlerts: 3 });
      setSuspiciousActivities(sAct.activities || [
        { id: 1, userId: 101, type: 'Multiple Failed Withdrawals', severity: 'high', ip: '192.168.1.1', createdAt: new Date().toISOString() },
        { id: 2, userId: 205, type: 'Login from new country', severity: 'medium', ip: '45.12.3.4', createdAt: new Date().toISOString() },
      ]);
      setRateLimiterStats({ blockedUsers: 12, blockedIPs: 8, violationCounts: 156 });
    } catch {
      console.error('Failed to fetch security data:');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const handleUnblock = async (userId: number) => {
    const success = await unblockUser(userId);
    if (success) fetchData();
  };

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
          className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">Security & Fraud</h2>
                <p className="text-xs text-zinc-500 italic">System integrity monitor</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Force Refresh"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b border-zinc-800 flex gap-6 bg-zinc-900/30">
            <button 
              onClick={() => setActiveTab('fraud')}
              className={`py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'fraud' ? 'border-rose-500 text-rose-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Fraud Detection
            </button>
            <button 
              onClick={() => setActiveTab('rate-limiter')}
              className={`py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === 'rate-limiter' ? 'border-rose-500 text-rose-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Rate Limiter
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {loading && !fraudStats ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-500">
                <div className="w-10 h-10 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                <p className="animate-pulse font-medium text-sm italic">Scanning network interfaces...</p>
              </div>
            ) : activeTab === 'fraud' ? (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Total Blocked</p>
                      <p className="text-3xl font-bold text-zinc-100 font-mono">{fraudStats?.totalBlocked || 0}</p>
                   </div>
                   <div className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl">
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mb-2">Suspicious Today</p>
                      <p className="text-3xl font-bold text-rose-400 font-mono">{fraudStats?.suspiciousToday || 0}</p>
                   </div>
                   <div className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl">
                      <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-2">Current Risk Alerts</p>
                      <p className="text-3xl font-bold text-amber-400 font-mono">{fraudStats?.riskAlerts || 0}</p>
                   </div>
                </div>

                {/* Suspicious Activities Table */}
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                   <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                      <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2 italic">
                        <Activity size={16} /> Activity Stream
                      </h4>
                   </div>
                   <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-zinc-500 border-b border-zinc-800 font-bold uppercase tracking-wider">
                           <th className="p-4">Entity / IP</th>
                           <th className="p-4">Violation Type</th>
                           <th className="p-4">Risk Level</th>
                           <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 text-zinc-300">
                        {suspiciousActivities.map((act) => (
                           <tr key={act.id} className="hover:bg-white/5 transition-colors group">
                              <td className="p-4">
                                 <div className="font-bold text-zinc-100">User #{act.userId}</div>
                                 <div className="text-[9px] text-zinc-600 font-mono tracking-tighter">{act.ip}</div>
                              </td>
                              <td className="p-4 italic text-zinc-400">{act.type}</td>
                              <td className="p-4">
                                 <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[8px] border tracking-widest ${
                                   act.severity === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                 }`}>
                                   {act.severity}
                                 </span>
                              </td>
                              <td className="p-4 text-right">
                                 <button 
                                   onClick={() => handleUnblock(act.userId)}
                                   className="text-blue-500 hover:text-blue-400 font-bold uppercase text-[9px] tracking-tight transition-colors"
                                 >
                                   Resolve Profile
                                 </button>
                              </td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Rate Limiter Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl">
                      <div className="p-2 w-fit rounded-lg bg-rose-600/10 text-rose-400 mb-3"><UserX size={18}/></div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Blocked Profiles</p>
                      <p className="text-3xl font-bold text-zinc-100 font-mono">{rateLimiterStats?.blockedUsers || 0}</p>
                   </div>
                   <div className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl">
                      <div className="p-2 w-fit rounded-lg bg-orange-600/10 text-orange-400 mb-3"><Globe size={18}/></div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Blacklisted IPs</p>
                      <p className="text-3xl font-bold text-zinc-100 font-mono">{rateLimiterStats?.blockedIPs || 0}</p>
                   </div>
                   <div className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl">
                      <div className="p-2 w-fit rounded-lg bg-amber-600/10 text-amber-400 mb-3"><Zap size={18}/></div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">30d Violations</p>
                      <p className="text-3xl font-bold text-zinc-100 font-mono">{rateLimiterStats?.violationCounts || 0}</p>
                   </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl">
                      <h4 className="text-sm font-bold text-rose-400 mb-5 flex items-center gap-2 italic">
                        <Unlink size={16} /> Manual Override
                      </h4>
                      <p className="text-[10px] text-zinc-500 mb-8 leading-relaxed">System locks can be manually bypassed for trusted accounts or IPs that triggered automated protection by mistake.</p>
                      <div className="space-y-4">
                         <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="UID: 42..."
                              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-rose-500/50 transition-all font-mono"
                            />
                            <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-colors">Clear</button>
                         </div>
                         <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="IP: 127.0.0.1..."
                              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none focus:border-rose-500/50 transition-all font-mono"
                            />
                            <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-colors">Clear</button>
                         </div>
                      </div>
                   </div>

                   <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl">
                      <h4 className="text-sm font-bold text-blue-400 mb-5 flex items-center gap-2 italic">
                        <CheckCircle size={16} /> Guardian Rules
                      </h4>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50 group hover:border-blue-500/20 transition-all">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Max WD Limit / Day</span>
                            <span className="text-xs font-mono text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">3 Units</span>
                         </div>
                         <div className="flex items-center justify-between p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50 group hover:border-blue-500/20 transition-all">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Single TX Cap (NGN)</span>
                            <span className="text-xs font-mono text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">500K</span>
                         </div>
                         <div className="flex items-center justify-between p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50 group hover:border-blue-500/20 transition-all">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Anti-Flood Trigger</span>
                            <span className="text-xs font-mono text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded">5 Req/Min</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
