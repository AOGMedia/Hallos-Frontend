'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, AlertCircle } from 'lucide-react';
import { quizAdminService } from '@/services/quizAdminService';
import { useQuizCategories } from '@/hooks/useQuizCategories';

interface UploadQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
}

export default function UploadQuestionsModal({ isOpen, onClose, categoryId: initialCategoryId }: UploadQuestionsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { categories, loading: categoriesLoading } = useQuizCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select an Excel or CSV file.'); return; }
    if (!categoryId.trim()) { setError('Please select a category.'); return; }

    startTransition(async () => {
      setError(null);
      setSuccess(null);
      try {
        const res = await quizAdminService.uploadQuestions(categoryId, file);
        if (res.success) {
          setSuccess(`Successfully added ${res.questionsAdded} questions. Skipped ${res.duplicatesSkipped} duplicates.`);
          setTimeout(() => { onClose(); setSuccess(null); setFile(null); }, 2500);
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setError(e.response?.data?.message || e.message || 'Failed to upload questions.');
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
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <UploadCloud size={20} className="text-indigo-400" /> Upload Questions
            </h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" /> {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 appearance-none"
                  required
                  disabled={categoriesLoading}
                >
                  <option value="">{categoriesLoading ? 'Loading categories...' : 'Select a category...'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.questionCount} questions)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Excel / CSV File</label>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                <button
                  type="submit"
                  disabled={isPending || !file || !categoryId}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-md transition-colors"
                >
                  {isPending ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
