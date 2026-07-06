'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, AlertCircle } from 'lucide-react';
import { quizAdminService, QuizQuestion } from '@/services/quizAdminService';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: QuizQuestion | null;
}

export default function QuestionFormModal({ isOpen, onClose, question }: QuestionFormModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState({ a: '', b: '', c: '', d: '' });
  const [correctAnswer, setCorrectAnswer] = useState('a');
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'>('easy');
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && question) {
      setQuestionText(question.questionText);
      setOptions(question.options);
      setCorrectAnswer(question.correctAnswer);
      setDifficulty(question.difficulty);
      setError(null);
    }
  }, [isOpen, question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    startTransition(async () => {
      setError(null);
      try {
        const res = await quizAdminService.updateQuestion(question.id, {
          questionText,
          options,
          correctAnswer,
          difficulty
        });
        if (res.success) {
          onClose(); // Parent handles refreshing list
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = e.response?.data?.message || e.message;
        setError(msg || 'Failed to update question.');
      }
    });
  };

  if (!isOpen || !question) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#121212] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-zinc-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a] shrink-0">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2"><Edit2 size={20} className="text-blue-400" /> Edit Question</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div className="p-6 overflow-y-auto">
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex gap-2"><AlertCircle size={16} /> {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                 <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Question Text</label>
                 <textarea
                   value={questionText}
                   onChange={(e) => setQuestionText(e.target.value)}
                   rows={2}
                   className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none"
                   required
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(['a', 'b', 'c', 'd'] as const).map(opt => (
                    <div key={opt}>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Option {opt.toUpperCase()}</label>
                      <input 
                         type="text" 
                         value={options[opt]} 
                         onChange={(e) => setOptions({...options, [opt]: e.target.value})} 
                         className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" 
                         required
                      />
                    </div>
                 ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                 <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Correct Answer</label>
                    <select 
                       value={correctAnswer}
                       onChange={(e) => setCorrectAnswer(e.target.value)}
                       className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    >
                       <option value="a">Option A</option>
                       <option value="b">Option B</option>
                       <option value="c">Option C</option>
                       <option value="d">Option D</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Difficulty</label>
                    <select 
                       value={difficulty}
                       onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                       className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                    >
                       <option value="easy">Easy</option>
                       <option value="medium">Medium</option>
                       <option value="hard">Hard</option>
                    </select>
                 </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-auto shrink-0 border-t border-zinc-800 mt-6 pt-4">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                 <button type="submit" disabled={isPending} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-md transition-colors">
                    {isPending ? 'Saving...' : 'Save Changes'}
                 </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
