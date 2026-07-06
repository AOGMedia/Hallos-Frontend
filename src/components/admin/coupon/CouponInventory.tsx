'use client';

import React from 'react';
import { 
  Search, 
  RefreshCw, 
  Ticket, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  History, 
  ChevronRight
} from 'lucide-react';
import { Coupon } from '@/types/coupon';

interface CouponInventoryProps {
  coupons: Coupon[];
  isLoading: boolean;
  filters: { status?: string; contentType?: string };
  fetchCoupons: (params?: { status?: string; contentType?: string }) => void;
  onDelete: (id: string) => void;
  onOpenHistory: (coupon: Coupon) => void;
}

export default function CouponInventory({ 
  coupons, 
  isLoading, 
  filters, 
  fetchCoupons, 
  onDelete, 
  onOpenHistory 
}: CouponInventoryProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/30 p-4 rounded-3xl border border-zinc-800/50">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search coupons by code..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filters.status || ''} 
            onChange={(e) => fetchCoupons({ status: e.target.value })}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider outline-none cursor-pointer hover:border-zinc-700 transition-all"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <button 
            onClick={() => fetchCoupons()}
            className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-48 bg-zinc-900/50 rounded-3xl animate-pulse border border-zinc-800" />
          ))
        ) : coupons.length > 0 ? (
          coupons.map((coupon) => (
            <div key={coupon.id} className="group relative bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-6 hover:border-zinc-700 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onDelete(coupon.id)}
                  className="p-2 rounded-xl bg-zinc-800 text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                  coupon.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {coupon.status === 'active' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tighter">{coupon.code}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{coupon.type} Coupon</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800/50 scale-95 hover:scale-100 transition-transform">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Discount</p>
                  <p className="text-sm font-bold text-zinc-200">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₦${(coupon.discountValue / 100).toLocaleString()}`}
                  </p>
                </div>
                <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800/50 scale-95 hover:scale-100 transition-transform">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Usages</p>
                  <p className="text-sm font-bold text-zinc-200">{coupon.usageCount} <span className="text-[10px] text-zinc-600 font-medium">/ {coupon.usageLimit ?? '∞'}</span></p>
                </div>
              </div>

              <button 
                onClick={() => onOpenHistory(coupon)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all group/btn"
              >
                <div className="flex items-center gap-2">
                  <History size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Usage History</span>
                </div>
                <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <Ticket size={48} className="mx-auto text-zinc-800" />
            <p className="text-zinc-500 font-medium italic">No coupons found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
