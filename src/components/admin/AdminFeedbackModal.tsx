import React, { useEffect, useState, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Star, MessageSquare, Trash2} from 'lucide-react';
import { feedbackService, AdminFeedbackFilters } from '@/services/feedbackService';

interface AdminFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Ensure types match what backend returns (as noted in feedback.md)
type FeedbackStats = {
  total: number;
  averageRating: string | number;
  recentFeedback: number;
  byStatus: Record<string, number>;
  byRating: Record<string, number>;
  byUserType: Record<string, number>;
  byCategory: Record<string, number>;
};

type FeedbackItem = {
  id: string;
  userId: number;
  userType: string;
  rating: number;
  category: string;
  subject?: string;
  message: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
  user?: { firstname?: string; lastname?: string; email?: string; role?: string };
};

export default function AdminFeedbackModal({ isOpen, onClose }: AdminFeedbackModalProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Pagination & Filters
  const limit = 10;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const res = await feedbackService.getFeedbackStats();
      if (res.success && res.stats) setStats(res.stats);
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  }, []);

  const fetchFeedbacks = useCallback(async (currentPage: number, status: string) => {
    setLoading(true);
    try {
      const filters: AdminFeedbackFilters = { page: currentPage, limit };
      if (status) filters.status = status;
      const res = await feedbackService.getAllFeedback(filters);

      if (res.success) {
        setFeedbacks(res.feedback || []);
        if (res.pagination) setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (error) {
      console.error('Feedback list fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on mount if open
  useEffect(() => {
    if (isOpen) {
      fetchStats();
      fetchFeedbacks(page, statusFilter);
    }
  }, [isOpen, page, statusFilter, fetchStats, fetchFeedbacks]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await feedbackService.updateFeedbackStatus(id, { status: newStatus });
        // Optimistically update local state instead of doing full network refetch to optimize performance
        setFeedbacks(prev => prev.map(fb => fb.id === id ? { ...fb, status: newStatus } : fb));
        fetchStats(); // Update stats in background
      } catch (err) {
        console.error('Failed to update status', err);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    
    startTransition(async () => {
      try {
        await feedbackService.deleteFeedback(id);
        // Optimistically remove from view
        setFeedbacks(prev => prev.filter(fb => fb.id !== id));
        fetchStats();
      } catch (err) {
        console.error('Failed to delete feedback', err);
      }
    });
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
              <MessageSquare className="text-zinc-400" size={24} />
              <h2 className="text-xl font-bold text-zinc-100">Feedback Management</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { fetchStats(); fetchFeedbacks(page, statusFilter); }}
                className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={18} />
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
                    <div className="bg-blue-900/20 border border-blue-900/40 p-4 rounded-xl">
                      <p className="text-xs text-blue-400 font-medium uppercase">Total Feedback</p>
                      <p className="text-2xl font-bold text-blue-100">{stats.total}</p>
                    </div>
                    <div className="bg-amber-900/20 border border-amber-900/40 p-4 rounded-xl">
                       <p className="text-xs text-amber-400 font-medium uppercase">Avg Rating</p>
                       <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-amber-100">{Number(stats.averageRating).toFixed(1)}</p>
                          <Star size={16} className="text-amber-400 fill-amber-400" />
                       </div>
                    </div>
                    <div className="bg-green-900/20 border border-green-900/40 p-4 rounded-xl">
                      <p className="text-xs text-green-400 font-medium uppercase">Reviewed</p>
                      <p className="text-2xl font-bold text-green-100">{stats.byStatus['reviewed'] || 0}</p>
                    </div>
                    <div className="bg-rose-900/20 border border-rose-900/40 p-4 rounded-xl">
                       <p className="text-xs text-rose-400 font-medium uppercase">New</p>
                       <p className="text-2xl font-bold text-rose-100">{stats.byStatus['new'] || 0}</p>
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
                   <option value="new">New</option>
                   <option value="reviewed">Reviewed</option>
                   <option value="in_progress">In Progress</option>
                   <option value="resolved">Resolved</option>
                </select>
             </div>

             {/* Feedback List */}
             <div className="space-y-4">
                {loading && feedbacks.length === 0 ? (
                  <div className="text-center text-zinc-500 py-10 animate-pulse">Loading feedback...</div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center text-zinc-500 py-10">No feedback entries found.</div>
                ) : (
                  feedbacks.map((item) => (
                    <div key={item.id} className={`p-4 rounded-xl border bg-black/50 transition-colors ${isPending ? 'opacity-60 pointer-events-none' : 'opacity-100'} ${item.status === 'new' ? 'border-amber-900/40' : 'border-zinc-800'}`}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full font-medium">
                              {item.rating} <Star size={10} className="fill-amber-500"/>
                            </span>
                            <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full capitalize">
                              {item.category?.replace('_', ' ')}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold
                              ${item.status === 'new' ? 'bg-rose-500/10 text-rose-500' : 
                                item.status === 'reviewed' ? 'bg-blue-500/10 text-blue-500' : 
                                item.status === 'resolved' ? 'bg-green-500/10 text-green-500' : 
                                'bg-zinc-800 text-zinc-400'}`}>
                              {item.status?.replace('_', ' ')}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-zinc-100 font-semibold text-sm">{item.subject || 'No Subject'}</h3>
                            <p className="text-zinc-400 text-sm mt-1 whitespace-pre-wrap">{item.message}</p>
                          </div>

                          <div className="text-xs text-zinc-500 flex items-center gap-2">
                            <span>{item.user?.firstname} {item.user?.lastname}</span>
                            <span>•</span>
                            <span>{item.user?.email}</span>
                            <span>•</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center gap-2 shrink-0">
                           <select
                              value={item.status}
                              onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                              className="bg-[#1a1a1a] border border-zinc-700 rounded-md text-xs px-2 py-1.5 text-zinc-200 outline-none hover:border-zinc-500 transition-colors"
                           >
                              <option value="new">New</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="dismissed">Dismissed</option>
                           </select>

                           <button
                             onClick={() => handleDelete(item.id)}
                             className="p-1.5 rounded-md hover:bg-rose-500/20 text-rose-400/70 hover:text-rose-400 transition-colors"
                             title="Delete Feedback"
                           >
                             <Trash2 size={16} />
                           </button>
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
                   disabled={page <= 1 || loading}
                   onClick={() => setPage(p => p - 1)}
                   className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   Previous
                </button>
                <button
                   disabled={page >= totalPages || loading}
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
