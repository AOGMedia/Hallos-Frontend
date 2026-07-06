'use client';

import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Users, 
  Ticket 
} from 'lucide-react';
import { AdminCouponAnalytics } from '@/types/coupon';

interface CouponAnalyticsProps {
  analytics: AdminCouponAnalytics | null;
  isLoading: boolean;
}

export default function CouponAnalytics({ analytics, isLoading }: CouponAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500 italic animate-pulse">
        Calculating global metrics...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-20 text-center text-zinc-500">
        Analytics data unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Aggregates Summary */}
        <div className="md:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] shadow-xl">
            <TrendingUp className="text-blue-400 mb-4" size={24} />
            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1.5">Total Redemptions</p>
            <p className="text-3xl font-black text-zinc-100">
              {analytics.aggregates.reduce((acc, curr) => acc + curr.totalRedemptions, 0)}
            </p>
          </div>
          <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-[2rem] shadow-xl">
            <DollarSign className="text-emerald-400 mb-4" size={24} />
            <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1.5">Gross Revenue (NGN)</p>
            <p className="text-3xl font-black text-zinc-100">
              ₦{(analytics.aggregates.filter(a => a.currency === 'NGN').reduce((acc, curr) => acc + curr.totalOriginalRevenue, 0)).toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-600/10 border border-purple-500/20 p-6 rounded-[2rem] shadow-xl">
            <Zap className="text-purple-400 mb-4" size={24} />
            <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1.5">Discount Impact</p>
            <p className="text-3xl font-black text-zinc-100">
              ₦{(analytics.aggregates.filter(a => a.currency === 'NGN').reduce((acc, curr) => acc + curr.totalDiscounts, 0)).toLocaleString()}
            </p>
          </div>
          <div className="bg-orange-600/10 border border-orange-500/20 p-6 rounded-[2rem] shadow-xl">
            <Users className="text-orange-400 mb-4" size={24} />
            <p className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-1.5">Partner Commissions</p>
            <p className="text-3xl font-black text-zinc-100">
              ₦{(analytics.aggregates.filter(a => a.currency === 'NGN').reduce((acc, curr) => acc + curr.totalPartnerCommissions, 0)).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] italic border-b border-zinc-800 pb-2">
          Top Performing Coupons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.topPerformingCoupons.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-5 bg-zinc-950/50 border border-zinc-800 rounded-3xl hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Ticket size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-200 uppercase tracking-tighter">{c.code}</p>
                  <p className="text-[10px] text-zinc-500 font-medium uppercase">{c.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-zinc-100">{c.totalRedemptions} USES</p>
                <p className="text-[10px] text-emerald-500 font-bold uppercase">₦{c.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
