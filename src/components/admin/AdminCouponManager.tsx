'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Ticket, 
} from 'lucide-react';
import { useAdminCouponStore } from '@/store/adminCouponStore';
import { useAdminDashboardStore } from '@/store/adminDashboardStore';
import { Coupon } from '@/types/coupon';

// Sub-components
import CouponInventory from './coupon/CouponInventory';
import CouponAnalytics from './coupon/CouponAnalytics';
import CouponCreateForm from './coupon/CouponCreateForm';
import CouponUsageHistory from './coupon/CouponUsageHistory';

export interface AdminCouponManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'list' | 'create' | 'analytics' | 'history';

export default function AdminCouponManager({ isOpen, onClose }: AdminCouponManagerProps) {
  const [activeView, setActiveView] = useState<View>('list');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  
  const { 
    coupons, 
    isLoading, 
    fetchCoupons, 
    analytics, 
    isLoadingAnalytics, 
    fetchAnalytics,
    usageHistory,
    isLoadingUsage,
    fetchUsageHistory,
    createCoupon,
    deleteCoupon,
    filters,
  } = useAdminCouponStore();

  const { showToast } = useAdminDashboardStore();

  // --- Effects ---
  useEffect(() => {
    if (isOpen) {
      if (activeView === 'list') fetchCoupons();
      if (activeView === 'analytics') fetchAnalytics();
    }
  }, [isOpen, activeView, fetchCoupons, fetchAnalytics]);

  // --- Handlers ---
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this coupon?')) {
      const success = await deleteCoupon(id);
      if (success) showToast('Coupon deactivated', 'success');
    }
  };

  const openHistory = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    fetchUsageHistory(coupon.id);
    setActiveView('history');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-black/90 backdrop-blur-md"
           onClick={onClose}
        />

        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="relative bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between px-8 py-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm z-10 shrink-0">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center shadow-inner">
                  <Ticket size={24} />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">Coupon Management</h2>
                  <p className="text-sm text-zinc-500 font-medium italic">Global administration & analytics center.</p>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
               <nav className="flex items-center bg-zinc-950/50 p-1.5 rounded-2xl border border-zinc-800/50">
                  {(['list', 'analytics', 'create'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setActiveView(v)}
                      className={`px-2 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        activeView === v || (activeView === 'history' && v === 'list')
                          ? 'bg-zinc-800 text-zinc-100 shadow-xl' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {v === 'list' ? 'Inventory' : v}
                    </button>
                  ))}
               </nav>

               <button
                 onClick={onClose}
                 className="p-2 rounded-2xl bg-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all border border-transparent hover:border-zinc-700"
               >
                 <X size={20} />
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            {activeView === 'list' && (
              <CouponInventory 
                coupons={coupons}
                isLoading={isLoading}
                filters={filters}
                fetchCoupons={fetchCoupons}
                onDelete={handleDelete}
                onOpenHistory={openHistory}
              />
            )}

            {activeView === 'analytics' && (
              <CouponAnalytics 
                analytics={analytics}
                isLoading={isLoadingAnalytics}
              />
            )}

            {activeView === 'create' && (
              <CouponCreateForm 
                createCoupon={createCoupon}
                showToast={showToast}
                onSuccess={() => setActiveView('list')}
              />
            )}

            {activeView === 'history' && selectedCoupon && (
              <CouponUsageHistory 
                coupon={selectedCoupon}
                usageHistory={usageHistory?.usages || []}
                isLoading={isLoadingUsage}
                onBack={() => setActiveView('list')}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
