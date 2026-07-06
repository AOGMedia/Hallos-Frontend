import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Briefcase, Building2 } from 'lucide-react';
import { useAdminRequests, useAdminStats, useUpdateCollaborationStatus } from '@/hooks/useUgc';

interface AdminAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminAgencyModal({ isOpen, onClose }: AdminAgencyModalProps) {
  // Pagination & Filters
  const limit = 10;
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch Data
  const { data: statsData, refetch: refetchStats } = useAdminStats();
  const { data: requestsData, isLoading, refetch: refetchRequests, isFetching } = useAdminRequests({
    page,
    limit,
    status: statusFilter || undefined,
  });

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateCollaborationStatus();

  const stats = statsData?.stats;
  const requests = requestsData?.requests || [];
  const pagination = requestsData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleRefresh = () => {
    refetchStats();
    refetchRequests();
  };

  const handleStatusUpdate = (id: string | number, newStatus: string) => {
    updateStatus({ id, status: newStatus });
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
              <Briefcase className="text-zinc-400" size={24} />
              <h2 className="text-xl font-bold text-zinc-100">Agency Requests Management</h2>
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
                      <p className="text-xs text-indigo-400 font-medium uppercase">Total Requests</p>
                      <p className="text-2xl font-bold text-indigo-100">{stats.totalRequests}</p>
                    </div>
                    <div className="bg-blue-900/20 border border-blue-900/40 p-4 rounded-xl">
                       <p className="text-xs text-blue-400 font-medium uppercase">Total Companies</p>
                       <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-blue-100">{stats.totalCompanies}</p>
                          <Building2 size={16} className="text-blue-400" />
                       </div>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-900/40 p-4 rounded-xl">
                      <p className="text-xs text-amber-400 font-medium uppercase">Pending</p>
                      <p className="text-2xl font-bold text-amber-100">{stats.byStatus['pending'] || 0}</p>
                    </div>
                    <div className="bg-emerald-900/20 border border-emerald-900/40 p-4 rounded-xl">
                       <p className="text-xs text-emerald-400 font-medium uppercase">Responded</p>
                       <p className="text-2xl font-bold text-emerald-100">{stats.byStatus['responded'] || 0}</p>
                    </div>
                </div>
             )}

             {/* Filters */}
             <div className="flex items-center justify-between mb-4">
                <select 
                   value={statusFilter}
                   onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                   className="bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-600"
                >
                   <option value="">All Statuses</option>
                   <option value="sent">Sent</option>
                   <option value="pending">Pending</option>
                   <option value="responded">Responded</option>
                   <option value="rejected">Rejected</option>
                </select>
             </div>

             {/* Requests List */}
             <div className="space-y-4">
                {isLoading && requests.length === 0 ? (
                  <div className="text-center text-zinc-500 py-10 animate-pulse">Loading requests...</div>
                ) : requests.length === 0 ? (
                  <div className="text-center text-zinc-500 py-10">No collaboration requests found.</div>
                ) : (
                  requests.map((item) => (
                    <div key={item.id} className={`p-4 rounded-xl border bg-black/50 transition-colors ${isUpdating ? 'opacity-60 pointer-events-none' : 'opacity-100'} ${item.status === 'pending' ? 'border-amber-900/40' : 'border-zinc-800'}`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 bg-blue-500/10 text-blue-500 text-xs px-2 py-1 rounded-full font-medium">
                              <Building2 size={12} /> {item.company?.companyName || item.companyName}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold
                              ${item.status === 'sent' ? 'bg-indigo-500/10 text-indigo-500' : 
                                item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                                item.status === 'responded' ? 'bg-emerald-500/10 text-emerald-500' : 
                                item.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                                'bg-zinc-800 text-zinc-400'}`}>
                              {item.status}
                            </span>
                          </div>

                          <div>
                            <p className="text-zinc-300 text-sm mt-2 whitespace-pre-wrap">{item.message}</p>
                          </div>

                          <div className="text-xs text-zinc-500 flex items-center gap-2 mt-2">
                            <span>{item.user?.firstname} {item.user?.lastname}</span>
                            <span>•</span>
                            <span>{item.user?.email}</span>
                            <span>•</span>
                            <span>{new Date(item.sentAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center gap-2 shrink-0">
                           <select
                              value={item.status}
                              onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                              className="bg-[#1a1a1a] border border-zinc-700 rounded-md text-xs px-2 py-1.5 text-zinc-200 outline-none hover:border-zinc-500 transition-colors"
                           >
                              <option value="sent">Sent</option>
                              <option value="pending">Pending</option>
                              <option value="responded">Responded</option>
                              <option value="rejected">Rejected</option>
                           </select>
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
