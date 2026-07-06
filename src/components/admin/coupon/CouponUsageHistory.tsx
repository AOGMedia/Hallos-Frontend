'use client';

import React from 'react';
import { 
  ArrowLeft, 
  History, 
  Video, 
  Radio, 
  RefreshCw, 
  Clock 
} from 'lucide-react';
import { Coupon, AdminCouponUsageItem } from '@/types/coupon';

interface CouponUsageHistoryProps {
  coupon: Coupon;
  usageHistory: AdminCouponUsageItem[];
  isLoading: boolean;
  onBack: () => void;
}

export default function CouponUsageHistory({ 
  coupon, 
  usageHistory, 
  isLoading, 
  onBack 
}: CouponUsageHistoryProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest border border-zinc-700/50"
      >
        <ArrowLeft size={14} /> Back to Inventory
      </button>

      <div className="bg-zinc-950/30 border border-zinc-800 rounded-[2.5rem] p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-600/10 text-orange-400 flex items-center justify-center shadow-inner">
              <History size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-zinc-100 tracking-tighter uppercase">{coupon.code}</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
                Usage Audit Log <span className="w-1 h-1 rounded-full bg-zinc-700" /> {coupon.usageCount} Redemptions
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-zinc-900/50 px-5 py-3 rounded-2xl border border-zinc-800">
              <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Total Discounted</p>
              <p className="text-xl font-black text-emerald-500">₦{(usageHistory.reduce((acc, curr) => acc + curr.discountAmount, 0) / 100).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="py-20 text-center text-zinc-500 italic animate-pulse">Retrieving audit logs...</div>
          ) : usageHistory.length > 0 ? (
            usageHistory.map((item) => (
              <div key={item.id} className="group flex items-center justify-between p-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-zinc-700">
                    {item.user ? `${item.user.firstname[0]}${item.user.lastname[0]}` : '??'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-200">{item.user?.firstname} {item.user?.lastname}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">{item.user?.email}</p>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                   <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/50 border border-white/5">
                      {item.contentType === 'video' && <Video size={12} className="text-blue-400" />}
                      {item.contentType === 'live_class' && <Radio size={12} className="text-emerald-400" />}
                      {item.contentType === 'live_series' && <RefreshCw size={12} className="text-orange-400" />}
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.contentType.replace('_', ' ')}</span>
                   </div>
                   <div className="text-right min-w-[100px]">
                      <p className="text-xs font-black text-zinc-100 uppercase tracking-tight">- ₦{(item.discountAmount / 100).toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase">Commission: ₦{(item.partnerCommissionAmount / 100).toLocaleString()}</p>
                   </div>
                </div>

                <div className="text-right flex items-center gap-4">
                   <div className="hidden sm:block">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1 justify-end">
                        <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-zinc-600 font-medium italic">{new Date(item.createdAt).toLocaleTimeString()}</p>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <History size={48} className="mx-auto text-zinc-800" />
              <p className="text-zinc-500 font-medium italic">No usage history found for this coupon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
