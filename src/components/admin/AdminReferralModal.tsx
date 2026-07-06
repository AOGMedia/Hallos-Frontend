import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Users, Link as LinkIcon, Activity } from 'lucide-react';
import { 
  useAdminReferralStats, 
  useAdminCommissions, 
  useApproveCommission, 
  useRejectCommission 
} from '@/hooks/useAdminReferrals';
import type { AdminCommissionRecord } from '@/lib/api/referral';

interface AdminReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminReferralModal({ isOpen, onClose }: AdminReferralModalProps) {
  // Pagination & Filters
  const limit = 10;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch Data
  const { data: statsData, refetch: refetchStats } = useAdminReferralStats();
  const { data: commissionsData, isLoading, refetch: refetchCommissions, isFetching } = useAdminCommissions({
    page,
    limit,
    status: statusFilter || undefined,
  });

  const { mutate: approveMutation, isPending: isApproving } = useApproveCommission();
  const { mutate: rejectMutation, isPending: isRejecting } = useRejectCommission();

  const isUpdating = isApproving || isRejecting;

  const stats = statsData?.stats;
  const commissions = commissionsData?.commissions || [];
  const pagination = commissionsData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleRefresh = () => {
    refetchStats();
    refetchCommissions();
  };

  const handleApprove = (id: string) => {
    approveMutation(id);
  };

  const handleReject = (id: string) => {
    // MVP basic prompt for rejection reason
    const reason = window.prompt("Reason for rejection:");
    if (reason) {
      rejectMutation({ id, reason });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-black/80 backdrop-blur-sm"
           onClick={onClose}
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#121212] rounded-2xl w-full max-w-5xl max-h-[90vh] shadow-2xl border border-zinc-800 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0 bg-[#1a1a1a] rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Users className="text-zinc-400" size={24} />
              <h2 className="text-xl font-bold text-zinc-100">Referral Commissions</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
             {/* Stats Header */}
             {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-indigo-900/20 border border-indigo-900/40 p-4 rounded-xl">
                      <p className="text-xs text-indigo-400 font-medium uppercase mb-1">Referral Codes</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-indigo-100">{stats.totalReferralCodes}</p>
                        <LinkIcon size={16} className="text-indigo-400" />
                      </div>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-900/40 p-4 rounded-xl">
                       <p className="text-xs text-blue-400 font-medium uppercase mb-1">Total Clicks</p>
                       <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-blue-100">{stats.totalClicks}</p>
                          <Activity size={16} className="text-blue-400" />
                       </div>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-900/40 p-4 rounded-xl">
                      <p className="text-xs text-amber-400 font-medium uppercase mb-1">Pending Payouts</p>
                      <div className="flex items-center justify-between">
                         <p className="text-2xl font-bold text-amber-100">₦{stats.byStatus['pending']?.total.toLocaleString() || 0}</p>
                         <p className="text-xs text-amber-500">{stats.byStatus['pending']?.count || 0} items</p>
                      </div>
                    </div>
                    <div className="bg-emerald-900/20 border border-emerald-900/40 p-4 rounded-xl">
                       <p className="text-xs text-emerald-400 font-medium uppercase mb-1">Approved Payouts</p>
                       <div className="flex items-center justify-between">
                         <p className="text-2xl font-bold text-emerald-100">₦{stats.byStatus['paid']?.total.toLocaleString() || 0}</p>
                         <p className="text-xs text-emerald-500">{stats.byStatus['paid']?.count || 0} items</p>
                       </div>
                    </div>
                </div>
             )}

             {/* Filters */}
             <div className="flex items-center justify-between mb-4 mt-2">
                <select 
                   value={statusFilter}
                   onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                   className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600"
                >
                   <option value="">All Statuses</option>
                   <option value="pending">Pending</option>
                   <option value="paid">Paid / Approved</option>
                   <option value="rejected">Rejected</option>
                </select>
             </div>

             {/* Requests List */}
             <div className="space-y-4">
                {isLoading && commissions.length === 0 ? (
                  <div className="text-center text-zinc-500 py-10 animate-pulse">Loading commissions...</div>
                ) : commissions.length === 0 ? (
                  <div className="text-center text-zinc-500 py-10">No commission records found.</div>
                ) : (
                  commissions.map((item: AdminCommissionRecord) => (
                    <div key={item.id} className={`p-4 rounded-xl border bg-black/50 transition-colors ${isUpdating ? 'opacity-60 pointer-events-none' : 'opacity-100'} ${item.status === 'pending' ? 'border-amber-900/40' : 'border-zinc-800'}`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold
                              ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                                item.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 
                                item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 
                                item.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                                'bg-zinc-800 text-zinc-400'}`}>
                              {item.status}
                            </span>
                            <span className="flex items-center gap-1 bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-full font-medium">
                              ₦{Number(item.commissionAmount).toLocaleString()}
                            </span>
                            <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
                              Code: {item.referralCode}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                             <div>
                                <p className="text-zinc-500 text-xs uppercase font-medium">Referrer</p>
                                <p className="text-zinc-200 text-sm">{item.referrer?.firstname} {item.referrer?.lastname}</p>
                                <p className="text-zinc-400 text-xs">{item.referrer?.email}</p>
                             </div>
                             <div>
                                <p className="text-zinc-500 text-xs uppercase font-medium">Referee (Student)</p>
                                <p className="text-zinc-200 text-sm">{item.referee?.firstname} {item.referee?.lastname}</p>
                                <p className="text-zinc-400 text-xs">{item.referee?.email}</p>
                             </div>
                          </div>

                          <div className="text-xs text-zinc-500 flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800/50">
                            <span>Purchased: {new Date(item.purchasedAt).toLocaleDateString()}</span>
                            {item.rejectionReason && (
                              <>
                                <span>•</span>
                                <span className="text-rose-400">Reason: {item.rejectionReason}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-zinc-800 pt-3 md:pt-0 md:pl-4 mt-3 md:mt-0">
                           {item.status === 'pending' ? (
                             <>
                               <button 
                                 onClick={() => handleApprove(item.id)}
                                 className="w-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-[6px] hover:bg-emerald-500/30 hover:text-emerald-300 transition-colors border border-emerald-900/50"
                               >
                                 Approve Payout
                               </button>
                               <button 
                                 onClick={() => handleReject(item.id)}
                                 className="w-full text-xs font-semibold bg-rose-500/10 text-rose-400 px-4 py-2 rounded-[6px] hover:bg-rose-500/20 hover:text-rose-300 transition-colors border border-rose-900/30"
                               >
                                 Reject
                               </button>
                             </>
                           ) : (
                             <div className="text-center w-full px-2 py-1">
                               <p className="text-xs text-zinc-500">Processed</p>
                               {item.paidAt && <p className="text-[10px] text-zinc-600">{new Date(item.paidAt).toLocaleDateString()}</p>}
                             </div>
                           )}
                        </div>

                      </div>
                    </div>
                  ))
                )}
             </div>

          </div>
          
          {/* Pagination Footer */}
          <div className="p-4 border-t border-zinc-800 bg-[#1a1a1a] rounded-b-2xl flex justify-between items-center text-sm">
             <div className="text-zinc-400">
                Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{Math.max(1, totalPages)}</span>
             </div>
             <div className="flex items-center gap-2">
                <button
                   disabled={page <= 1 || isLoading || isFetching}
                   onClick={() => setPage(p => p - 1)}
                   className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   Previous
                </button>
                <button
                   disabled={page >= totalPages || isLoading || isFetching}
                   onClick={() => setPage(p => p + 1)}
                   className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   Next
                </button>
             </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
