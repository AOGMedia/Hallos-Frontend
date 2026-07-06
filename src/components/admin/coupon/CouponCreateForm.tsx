'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  Loader2 
} from 'lucide-react';
import { 
  DiscountType, 
  ContentType, 
  UserPickerOption, 
  AdminCouponCreatePayload 
} from '@/types/coupon';
import UserPicker from './UserPicker';
import ContentPicker, { ContentOption } from './ContentPicker';

interface CouponCreateFormProps {
  createCoupon: (payload: AdminCouponCreatePayload) => Promise<boolean>;
  showToast: (message: string, type: 'success' | 'error') => void;
  onSuccess: () => void;
}

export default function CouponCreateForm({ createCoupon, showToast, onSuccess }: CouponCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPickerOption | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContentOption[]>([]);
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'partner' as 'partner' | 'creator',
    discountType: 'percentage' as DiscountType,
    discountValue: 0,
    partnerCommissionPercent: 17,
    usageLimit: '',
    startsAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    applicableContentTypes: ['video', 'live_class', 'live_series'] as ContentType[],
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !selectedUser) {
      showToast('Please fill required fields and select a user', 'error');
      return;
    }

    setIsSubmitting(true);
    const payload: AdminCouponCreatePayload = {
      code: formData.code,
      type: formData.type,
      discountType: formData.discountType,
      discountValue: formData.discountType === 'flat' ? formData.discountValue * 100 : formData.discountValue,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      partnerUserId: formData.type === 'partner' ? selectedUser.id : null,
      creatorId: formData.type === 'creator' ? selectedUser.id : null,
      startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      applicableContentTypes: formData.applicableContentTypes,
      specificContentIds: selectedContent.length > 0 ? selectedContent.map(c => c.value) : null,
      partnerCommissionPercent: formData.type === 'partner' ? formData.partnerCommissionPercent : null,
    };

    const success = await createCoupon(payload);
    if (success) {
      showToast('Coupon created successfully', 'success');
      onSuccess();
    } else {
      showToast('Failed to create coupon', 'error');
    }
    setIsSubmitting(false);
  };

  const toggleSelectedContent = (option: ContentOption) => {
    setSelectedContent(prev =>
      prev.find(c => c.value === option.value)
        ? prev.filter(c => c.value !== option.value)
        : [...prev, option]
    );
  };

  return (
    <form onSubmit={handleCreateSubmit} className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Configuration */}
        <div className="space-y-6">
          <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-[2rem] space-y-4">
            <h3 className="text-[10px] font-black text-zinc-100 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Zap size={14} className="text-orange-400" /> Basic Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Coupon Code</label>
                <input 
                  type="text" 
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold uppercase"
                  placeholder="e.g. SAVE2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as 'partner' | 'creator'})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                    >
                       <option value="partner">Partner</option>
                       <option value="creator">Creator</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Discount Type</label>
                    <select 
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value as DiscountType})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                    >
                       <option value="percentage">Percentage (%)</option>
                       <option value="flat">Flat Amount (₦)</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Value</label>
                    <input 
                      type="number" 
                      required
                      value={isNaN(formData.discountValue) ? '' : formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value === '' ? NaN : parseFloat(e.target.value)})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold"
                    />
                 </div>
                 {formData.type === 'partner' && (
                   <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Commission (%)</label>
                      <input 
                        type="number" 
                        required
                        value={isNaN(formData.partnerCommissionPercent) ? '' : formData.partnerCommissionPercent}
                        onChange={(e) => setFormData({...formData, partnerCommissionPercent: e.target.value === '' ? NaN : parseFloat(e.target.value)})}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold"
                      />
                   </div>
                 )}
               </div>
             </div>
          </div>

          <ContentPicker 
            selectedUser={selectedUser}
            applicableContentTypes={formData.applicableContentTypes}
            selectedContent={selectedContent}
            onToggleContent={toggleSelectedContent}
            onUpdateApplicableTypes={(types) => setFormData({...formData, applicableContentTypes: types})}
          />
        </div>

        {/* Right: Targets & Scheduling */}
        <div className="space-y-6">
          <UserPicker 
            selectedUser={selectedUser}
            onSelect={setSelectedUser}
            type={formData.type}
          />

          <div className="bg-zinc-950/50 border border-zinc-800 p-6 rounded-[2rem] space-y-4">
             <h3 className="text-[10px] font-black text-zinc-100 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Clock size={14} className="text-emerald-400" /> Scheduling
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Start Date</label>
                   <input 
                     type="date"
                     value={formData.startsAt}
                     onChange={(e) => setFormData({...formData, startsAt: e.target.value})}
                     className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                   />
                </div>
                <div>
                   <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Expiry Date</label>
                   <input 
                     type="date"
                     value={formData.expiresAt}
                     onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                     className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                   />
                </div>
             </div>
             <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1.5 block">Total Usage Limit</label>
                <input 
                   type="number"
                   value={formData.usageLimit}
                   onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                   placeholder="Unlimited if empty"
                   className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none"
                />
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
         <button 
           type="submit"
           disabled={isSubmitting}
           className="px-10 py-4 rounded-[2rem] bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
         >
           {isSubmitting ? (
             <>
               <Loader2 className="animate-spin" size={18} />
               <span>Deploying...</span>
             </>
           ) : (
             <>
               <span>Create Coupon</span>
             </>
           )}
         </button>
      </div>
    </form>
  );
}
