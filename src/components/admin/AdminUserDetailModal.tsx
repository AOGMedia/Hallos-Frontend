'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Globe, Calendar, Shield, Wallet, ShoppingBag, BookOpen, AlertCircle, Save } from 'lucide-react';
import { useAdminDashboardStore } from '@/store/adminDashboardStore';

interface AdminUserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminUserDetailModal({ isOpen, onClose }: AdminUserDetailModalProps) {
  const { currentUser, loadingUserDetail, updateUserRole } = useAdminDashboardStore();
  const [newRole, setNewRole] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync local role state when currentUser loads
  React.useEffect(() => {
    if (currentUser) {
      setNewRole(currentUser.role);
    }
  }, [currentUser]);

  const handleUpdateRole = async () => {
    if (!currentUser || newRole === currentUser.role) return;
    
    setIsUpdating(true);
    await updateUserRole(currentUser.id, newRole);
    setIsUpdating(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-black/80 backdrop-blur-md"
           onClick={onClose}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <User size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-100">User Profile</h2>
                <p className="text-xs text-zinc-500">View and manage user information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {loadingUserDetail ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-500">
                <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="animate-pulse font-medium">Fetching user details...</p>
              </div>
            ) : currentUser ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info & Role */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl">
                    <div className="flex flex-col items-center text-center space-y-4 mb-6">
                       <div className="w-20 h-20 rounded-3xl bg-blue-600/10 text-blue-500 flex items-center justify-center text-3xl font-bold border border-blue-500/20">
                          {currentUser.firstname?.[0] || 'U'}{currentUser.lastname?.[0] || ''}
                       </div>
                       <div>
                          <h3 className="text-lg font-bold text-zinc-100">{currentUser.firstname} {currentUser.lastname}</h3>
                          <p className="text-sm text-zinc-500 flex items-center justify-center gap-1.5 mt-1">
                            <Mail size={14} /> {currentUser.email}
                          </p>
                       </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-zinc-800">
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500 flex items-center gap-2"><Globe size={14}/> Country</span>
                          <span className="text-zinc-200 font-medium">{currentUser.country}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500 flex items-center gap-2"><Calendar size={14}/> Joined</span>
                          <span className="text-zinc-200 font-medium">{new Date(currentUser.createdAt).toLocaleDateString()}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500 flex items-center gap-2"><Shield size={14}/> Current Role</span>
                          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-blue-500/20">
                            {currentUser.role}
                          </span>
                       </div>
                    </div>
                  </div>

                  <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-2xl">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Manage Permissions</h4>
                    <div className="space-y-4">
                       <div>
                         <label className="text-xs text-zinc-400 mb-1.5 block">Update User Role</label>
                         <select 
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                         >
                            <option value="viewer">Viewer</option>
                            <option value="creator">Creator</option>
                            <option value="admin">Admin</option>
                         </select>
                       </div>
                       <button 
                         onClick={handleUpdateRole}
                         disabled={isUpdating || newRole === currentUser.role}
                         className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:bg-zinc-800"
                       >
                         {isUpdating ? (
                           <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                         ) : (
                           <Save size={16} />
                         )}
                         Update Role
                       </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Wallet & Activity */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Wallets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {Object.entries(currentUser.walletBalances || {}).map(([currency, balance]: [string, { available: string; pending: string }]) => (
                        <div key={currency} className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
                           <div className={`p-3 rounded-xl bg-blue-600/10 text-blue-400`}>
                              <Wallet size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">{currency} Balance</p>
                              <p className="text-xl font-bold text-zinc-100">{Number(balance?.available || 0).toLocaleString()}</p>
                              <p className="text-[10px] text-zinc-500 italic">Pending: {Number(balance?.pending || 0).toLocaleString()}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Activity Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl">
                       <div className="flex items-center gap-3 mb-4">
                          <ShoppingBag size={18} className="text-emerald-500" />
                          <h4 className="text-sm font-bold text-zinc-200">Purchases</h4>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                             <span className="text-zinc-500">Total Count</span>
                             <span className="text-zinc-200 font-medium">{currentUser.purchaseSummary?.totalPurchases || 0}</span>
                          </div>
                          {Object.entries(currentUser.purchaseSummary?.totalSpent || {}).map(([cur, amt]: [string, number]) => (
                             <div key={cur} className="flex justify-between text-xs">
                                <span className="text-zinc-500">Spent ({cur})</span>
                                <span className="text-zinc-200 font-medium font-mono">{Number(amt || 0).toLocaleString()}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl">
                       <div className="flex items-center gap-3 mb-4">
                          <BookOpen size={18} className="text-purple-500" />
                          <h4 className="text-sm font-bold text-zinc-200">Enrollments</h4>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                             <span className="text-zinc-500">Courses Enrolled</span>
                             <span className="text-zinc-200 font-medium">{currentUser.courseEnrollments?.length || 0}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Recent Activity TABS placeholder or simple list */}
                  <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                       <h4 className="text-sm font-bold text-zinc-200 italic">Recent Transactions</h4>
                       <button className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors">Explorer</button>
                    </div>
                    <div className="divide-y divide-zinc-800/50">
                       {(currentUser.purchaseSummary?.recentPurchases?.length ?? 0) > 0 ? (
                         currentUser.purchaseSummary?.recentPurchases?.map((p, idx) => (
                           <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <ShoppingBag size={14} />
                                 </div>
                                 <div>
                                    <p className="text-xs font-semibold text-zinc-200">{p.item || 'Purchase'}</p>
                                    <p className="text-[10px] text-zinc-500 italic">{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</p>
                                 </div>
                              </div>
                              <p className="text-xs font-bold text-zinc-100 font-mono tracking-tighter">{p.currency || ''} {(p.amount || 0).toLocaleString()}</p>
                           </div>
                         ))
                       ) : (
                         <div className="p-8 text-center text-zinc-500 text-xs italic">No activity history found.</div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 flex flex-col items-center gap-4">
                 <AlertCircle size={32} />
                 <p>User profile could not be loaded. Please refresh.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
