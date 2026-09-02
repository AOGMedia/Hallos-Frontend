'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HandCoins, AlertCircle } from 'lucide-react';
import { quizAdminService } from '@/services/quizAdminService';
import UserPicker from '@/components/admin/coupon/UserPicker';
import type { UserPickerOption } from '@/types/coupon';

interface AdjustBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdjustBalanceModal({ isOpen, onClose }: AdjustBalanceModalProps) {
  // Selected via the shared UserPicker rather than a typed-in ID: an admin
  // pasting the wrong number here silently credits or debits a stranger's
  // wallet, and there was nothing on screen to catch it — no name, no email,
  // no confirmation of who was about to be adjusted.
  const [selectedUser, setSelectedUser] = useState<UserPickerOption | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedUser(null);
    setAmount('');
    setReason('');
  };

  const handleClose = () => {
    // Don't leave a stale target selected for the next time this opens.
    resetForm();
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || amount === '' || !reason) {
       setError('Select a user and fill in all fields.');
       return;
    }
    if (Number(amount) === 0) {
       setError('Amount must not be zero.');
       return;
    }

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      try {
        const res = await quizAdminService.adjustUserBalance(selectedUser.id, Number(amount), reason);
        if (res.success) {
          setSuccess(
            `Balance adjusted for ${selectedUser.firstname} ${selectedUser.lastname}. New balance: ${res.newBalance.toLocaleString()} MP`
          );
          setTimeout(() => {
             onClose();
             setSuccess(null);
             resetForm();
          }, 2500);
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = e.response?.data?.message || e.message;
        setError(msg || 'Failed to adjust balance.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#121212] rounded-2xl w-full max-w-md shadow-2xl border border-zinc-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a] shrink-0">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2"><HandCoins size={20} className="text-blue-400" /> Adjust User Balance</h2>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div className="p-6">
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex gap-2"><AlertCircle size={16} /> {error}</div>}
            {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
               <UserPicker
                 selectedUser={selectedUser}
                 onSelect={setSelectedUser}
                 type="creator"
               />

               <div>
                 <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Amount to Adjust (MP)</label>
                 <input
                   type="number"
                   value={amount}
                   onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                   className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                   placeholder="Can be negative to deduct"
                   required
                 />
                 {amount !== '' && Number(amount) !== 0 && (
                   <p className="mt-1.5 text-[11px] text-zinc-500">
                     {Number(amount) > 0 ? 'Credits' : 'Debits'}{' '}
                     <span className="text-zinc-300 font-semibold">
                       {Math.abs(Number(amount)).toLocaleString()} MP
                     </span>{' '}
                     ({Number(amount) > 0 ? '+' : '−'}₦{(Math.abs(Number(amount)) * 14).toLocaleString()})
                   </p>
                 )}
              </div>

               <div>
                 <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Reason</label>
                 <textarea
                   value={reason}
                   onChange={(e) => setReason(e.target.value)}
                   className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none"
                   rows={2}
                   placeholder="e.g. Compensation for technical issue"
                   required
                 />
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-zinc-800 pt-4">
                 <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                 <button
                   type="submit"
                   disabled={isPending || !selectedUser || amount === '' || !reason}
                   className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg shadow-md transition-colors"
                 >
                    {isPending ? 'Processing...' : 'Adjust Balance'}
                 </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
