'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, AlertCircle } from 'lucide-react';
import { quizAdminService } from '@/services/quizAdminService';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryFormModal({ isOpen, onClose }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Category name is required.');

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      try {
        const res = await quizAdminService.createCategory({ name, description });
        if (res.success) {
          setSuccess(`Category created with ID: ${res.categoryId}`);
          setTimeout(() => {
             onClose();
             setSuccess(null);
             setName('');
             setDescription('');
          }, 2500);
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = e.response?.data?.message || e.message;
        setError(msg || 'Failed to create category.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#121212] rounded-2xl w-full max-w-md shadow-2xl border border-zinc-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a]">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2"><FolderPlus size={20} className="text-indigo-400" /> Create Category</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div className="p-6">
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex gap-2"><AlertCircle size={16} /> {error}</div>}
            {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category Name</label>
                <input 
                   type="text" 
                   value={name} 
                   onChange={(e) => setName(e.target.value)} 
                   placeholder="e.g. Science & Technology"
                   className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" 
                   required
                />
              </div>

              <div>
                 <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                 <textarea
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Short overview..."
                   rows={3}
                   className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none"
                 />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                 <button type="submit" disabled={isPending || !name} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-md transition-colors">
                    {isPending ? 'Creating...' : 'Create'}
                 </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
