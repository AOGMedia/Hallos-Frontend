'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, AlertCircle } from 'lucide-react';
import { quizAdminService, QuizTournament, CreateTournamentData } from '@/services/quizAdminService';

interface TournamentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: QuizTournament | null;
}

export default function TournamentFormModal({ isOpen, onClose, tournament }: TournamentFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Creating new tournament requires categoryId per docs
  const [categoryId, setCategoryId] = useState('');
  
  const [entryFee, setEntryFee] = useState(100);
  const [maxParticipants, setMaxParticipants] = useState(64);
  const [minParticipants, setMinParticipants] = useState(8);
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [startTime, setStartTime] = useState('');
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (tournament) {
        setName(tournament.name);
        setEntryFee(tournament.entryFee || 0);
        setMaxParticipants(tournament.maxParticipants || 64);
        setMinParticipants(tournament.minParticipants || 8);
        setRegistrationDeadline(tournament.registrationDeadline ? tournament.registrationDeadline.slice(0, 16) : '');
        setStartTime(tournament.startTime ? tournament.startTime.slice(0, 16) : '');
      } else {
        setName('');
        setDescription('');
        setCategoryId('');
        setEntryFee(100);
        setMaxParticipants(64);
        setMinParticipants(8);
        setRegistrationDeadline('');
        setStartTime('');
      }
      setError(null);
    }
  }, [isOpen, tournament]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      setError(null);
      try {
        if (tournament) {
          // Update
          // Docs mention: name, entryFee, maxParticipants for update
          const res = await quizAdminService.updateTournament(tournament.id, {
            name, entryFee: Number(entryFee), maxParticipants: Number(maxParticipants)
          });
          if (res.success) onClose();
        } else {
          // Create
          if (!categoryId) { setError('A target category UUID is required'); return; }
          const payload: CreateTournamentData = {
            name, description, categoryId, entryFee: Number(entryFee),
            maxParticipants: Number(maxParticipants), minParticipants: Number(minParticipants),
            registrationDeadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : undefined,
            startTime: startTime ? new Date(startTime).toISOString() : undefined,
            format: 'knockout',
            prizeDistribution: { first: 60, second: 30, third: 10 },
          };
          const res = await quizAdminService.createTournament(payload);
          if (res.success) onClose();
        }
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = e.response?.data?.message || e.message;
        setError(msg || 'Failed to process tournament.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#121212] rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl border border-zinc-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a] shrink-0">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2"><Trophy size={20} className="text-indigo-400" /> {tournament ? 'Edit Tournament' : 'Create Tournament'}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div className="p-6 overflow-y-auto scrollbar-hide">
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex gap-2"><AlertCircle size={16} /> {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                 <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Tournament Name</label>
                 <input
                   type="text"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                   required
                 />
              </div>

              {/* Only show these on Create based on docs endpoints context, but we can show them always if allowed */}
              {!tournament && (
                 <>
                   <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none"
                        rows={2}
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category UUID</label>
                      <input
                        type="text"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                        required
                      />
                   </div>
                 </>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Entry Fee (₦)</label>
                    <input 
                       type="number" 
                       min="0"
                       value={entryFee} 
                       onChange={(e) => setEntryFee(Number(e.target.value))} 
                       className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" 
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Min Participants</label>
                    <input 
                       type="number" 
                       min="2"
                       value={minParticipants} 
                       onChange={(e) => setMinParticipants(Number(e.target.value))} 
                       className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" 
                       disabled={!!tournament} // Assuming edit doesn't change min
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Max Participants</label>
                    <input 
                       type="number" 
                       min="2"
                       value={maxParticipants} 
                       onChange={(e) => setMaxParticipants(Number(e.target.value))} 
                       className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" 
                    />
                 </div>
              </div>

               {!tournament && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Registration Deadline</label>
                       <input 
                          type="datetime-local" 
                          value={registrationDeadline} 
                          onChange={(e) => setRegistrationDeadline(e.target.value)} 
                          className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" 
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Start Time</label>
                       <input 
                          type="datetime-local" 
                          value={startTime} 
                          onChange={(e) => setStartTime(e.target.value)} 
                          className="w-full bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" 
                       />
                    </div>
                 </div>
               )}

              <div className="pt-4 flex justify-end gap-3 mt-auto shrink-0 border-t border-zinc-800 mt-6 pt-4">
                 <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
                 <button type="submit" disabled={isPending} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-md transition-colors">
                    {isPending ? 'Saving...' : (tournament ? 'Save Changes' : 'Create Tournament')}
                 </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
