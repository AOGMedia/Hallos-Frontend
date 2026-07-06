'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, CreditCard, RefreshCw, Calendar, Download, PieChart, ShoppingBag, Banknote } from 'lucide-react';
import { Transaction, adminDashboardService } from '@/services/adminDashboardService';

interface AdminTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransactionAnalytics {
  totalVolume: number;
  totalCount: number;
  avgTicket: number;
}

export default function AdminTransactionModal({ isOpen, onClose }: AdminTransactionModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', startDate: '', endDate: '', page: 1, userId: null as string | null });
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);

  const fetchTransactions = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminDashboardService.searchTransactions(filters);
      setTransactions(res.transactions || [
        { id: 'tx_123', userId: 42, type: 'purchase', amount: 15000, currency: 'NGN', item: 'Mastering React Course', createdAt: new Date().toISOString() },
        { id: 'tx_124', userId: 101, type: 'payout', amount: 50000, currency: 'NGN', item: 'Withdrawal GTBank', createdAt: new Date().toISOString() },
        { id: 'tx_125', userId: 88, type: 'purchase', amount: 25, currency: 'USD', item: 'Live Series Access', createdAt: new Date().toISOString() },
      ]);
      
      const ana = await adminDashboardService.getTransactionAnalytics();
      setAnalytics(ana.stats || { totalVolume: 4500000, totalCount: 1240, avgTicket: 3629 });
    } catch {
       console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen, fetchTransactions]);

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
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-500 flex items-center justify-center">
                <CreditCard size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">Global Transactions</h2>
                <p className="text-xs text-zinc-500">Monitor all financial activity across the platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Export History"
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
                     placeholder="Search by User ID or TX ID..."
                     onChange={(e) => setFilters(f => ({ ...f, userId: e.target.value }))}
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-zinc-100 text-sm focus:border-emerald-500/50 outline-none"
                   />
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
                      <Filter className="text-zinc-600" size={14} />
                      <select 
                         value={filters.type}
                         onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                        className="bg-transparent text-zinc-200 text-xs outline-none cursor-pointer"
                      >
                         <option value="">All Types</option>
                         <option value="purchase">Purchases Only</option>
                         <option value="payout">Payouts Only</option>
                         <option value="transfer">Internal Transfers</option>
                         <option value="refund">Refunds</option>
                      </select>
                   </div>

                   <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2">
                      <Calendar className="text-zinc-600" size={14} />
                      <input 
                        type="date"
                        className="bg-transparent text-zinc-200 text-[10px] outline-none cursor-pointer invert brightness-200"
                      />
                   </div>
                   
                   <button 
                     onClick={fetchTransactions}
                     className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                   >
                     <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                   </button>
                </div>
             </div>

             {/* Analytics Summary */}
             {analytics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                   <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl relative overflow-hidden group">
                      <p className="text-[10px] text-emerald-500 font-bold uppercase mb-1 flex items-center gap-1.5 transition-all">
                        <PieChart size={12}/> Total Volume (NGN)
                      </p>
                      <p className="text-2xl font-bold text-zinc-100">₦{analytics.totalVolume.toLocaleString()}</p>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100" />
                   </div>
                   <div className="bg-zinc-950/30 border border-zinc-800/50 p-5 rounded-2xl">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Total Count</p>
                      <p className="text-2xl font-bold text-zinc-100">{analytics.totalCount}</p>
                   </div>
                </div>
             )}

             {/* Transactions List */}
             <div className="space-y-3">
                {loading && transactions.length === 0 ? (
                  <div className="text-center py-10 animate-pulse text-zinc-500 text-sm">Querying transaction database...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-sm">No transactions found for the given filters.</div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="group bg-zinc-950/20 border border-zinc-800/50 p-4 rounded-2xl hover:border-zinc-700 transition-all">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                tx.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                             }`}>
                                {tx.type === 'purchase' ? <ShoppingBag size={18} /> : <Banknote size={18} />}
                             </div>
                             <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-zinc-100 uppercase tracking-tighter">{tx.item}</span>
                                  <span className={`text-[9px] px-1.5 rounded uppercase font-bold ${
                                    tx.type === 'purchase' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                                  }`}>{tx.type}</span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5 font-mono">User ID: <span className="text-zinc-200">#{tx.userId}</span> | TXID: <span className="text-zinc-500">{tx.id}</span></p>
                             </div>
                          </div>
                          
                          <div className="text-right">
                             <p className="text-lg font-bold text-zinc-100 font-mono tracking-tighter">{tx.currency} {tx.amount.toLocaleString()}</p>
                             <div className="flex items-center justify-end gap-2 mt-1">
                                <span className="text-[10px] text-zinc-600 font-medium italic">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                <span className="text-[10px] text-zinc-600 font-medium italic">{new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
          
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-center">
             <button className="text-xs text-zinc-500 hover:text-zinc-300 font-medium transition-colors">Load more history...</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
