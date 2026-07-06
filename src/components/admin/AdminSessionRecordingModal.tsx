'use client';

import React, { useEffect, useState, useCallback, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Send, History, Video, Plus, Trash2, Mail } from 'lucide-react';
import { adminService, SessionRecording, RecordingHistoryItem } from '@/services/adminService';
import { listSeries } from '@/services/seriesService';
import type { Series } from '@/types/series';

interface AdminSessionRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSessionRecordingModal({ isOpen, onClose }: AdminSessionRecordingModalProps) {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Send Recordings State
  const [recordings, setRecordings] = useState<SessionRecording[]>([{ sessionNumber: 1, driveLink: '' }]);
  const [customMessage, setCustomMessage] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  // History State
  const [history, setHistory] = useState<RecordingHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchSeries = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch active series - assuming admins need to see all live series. 
      // The API returns public series, which should suffice for sending recordings to students.
      const series = await listSeries(); 
      setSeriesList(series || []);
      if (series?.length > 0 && !selectedSeriesId) {
         setSelectedSeriesId(series[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch series:', err);
      setError('Failed to load series list.');
    } finally {
      setLoading(false);
    }
  }, [selectedSeriesId]);

  const fetchHistory = useCallback(async (seriesId: string) => {
    if (!seriesId) return;
    try {
      setHistoryLoading(true);
      const res = await adminService.getRecordingHistory(seriesId);
      if (res.success) {
        setHistory(res.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch recording history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSeries();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, fetchSeries]);

  useEffect(() => {
    if (isOpen && activeTab === 'history' && selectedSeriesId) {
      fetchHistory(selectedSeriesId);
    }
  }, [isOpen, activeTab, selectedSeriesId, fetchHistory]);

  const handleAddRecording = () => {
    const nextSession = recordings.length > 0 ? Math.max(...recordings.map(r => r.sessionNumber)) + 1 : 1;
    setRecordings([...recordings, { sessionNumber: nextSession, driveLink: '' }]);
  };

  const handleRemoveRecording = (index: number) => {
    if (recordings.length > 1) {
      setRecordings(recordings.filter((_, i) => i !== index));
    }
  };

  const handleRecordingChange = (index: number, field: keyof SessionRecording, value: string | number) => {
    const updated = [...recordings];
    updated[index] = { ...updated[index], [field]: value };
    setRecordings(updated);
  };

  const validatePayload = () => {
    setError(null);
    setSuccess(null);
    if (!selectedSeriesId) {
      setError('Please select a series first.');
      return false;
    }
    const emptyLinks = recordings.some(r => !r.driveLink.trim());
    if (emptyLinks) {
      setError('Please provide a Google Drive link for all recordings.');
      return false;
    }
    return true;
  };

  const handleSendToStudent = async () => {
    if (!validatePayload()) return;
    if (!studentEmail.trim()) {
      setError('Please provide a student email address.');
      return;
    }

    startTransition(async () => {
      try {
        const payload = { recordings, customMessage, testEmail: studentEmail };
        const res = await adminService.sendTestRecording(selectedSeriesId, payload);
        if (res.success) {
          if (res.student) {
             setSuccess(`Recording sent to ${res.student.firstname} ${res.student.lastname} (${res.student.email})`);
          } else {
             setSuccess(res.message || 'Recording sent successfully!');
          }
        }
      } catch (err: unknown) {
         const error = err as Error & { response?: { data?: { message?: string } } };
         const apiError = error.response?.data?.message || error.message;
         setError(apiError || 'Failed to send recording to student.');
      }
    });
  };

  const handleSendAll = async () => {
    if (!validatePayload()) return;
    if (!confirm('Are you sure you want to send emails to all enrolled students?')) return;

    startTransition(async () => {
      try {
        const payload = { recordings, customMessage };
        const res = await adminService.sendRecordings(selectedSeriesId, payload);
        if (res.success) {
          setSuccess(`Sent! Newly sent: ${res.newlySent}, Already sent: ${res.alreadySent}, Failed: ${res.failed}.`);
          if (activeTab === 'history') fetchHistory(selectedSeriesId); // Refresh history if active
          
          // Clear form fields for improved UX
          setRecordings([{ sessionNumber: 1, driveLink: '' }]);
          setCustomMessage('');
          setStudentEmail('');
        }
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || 'Failed to send recordings.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="absolute inset-0 bg-black/80 backdrop-blur-sm"
           onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[#121212] rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl border border-zinc-800 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#1a1a1a] rounded-t-2xl shrink-0">
            <div className="flex items-center gap-3">
              <Video className="text-zinc-400" size={24} />
              <h2 className="text-xl font-bold text-zinc-100">Session Recordings</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-[1] overflow-y-auto w-full flex flex-col sm:flex-row scrollbar-hide">
            
            {/* Left Sidebar (Series Selection & Tabs) */}
            <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-zinc-800 p-6 flex flex-col gap-6 shrink-0 bg-[#151515]">
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Series</label>
                 <select
                   value={selectedSeriesId}
                   onChange={(e) => {
                      setSelectedSeriesId(e.target.value);
                      setError(null);
                      setSuccess(null);
                   }}
                   className="w-full bg-black border border-zinc-700 rounded-lg py-2 px-3 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                   disabled={loading}
                 >
                    {loading && <option>Loading series...</option>}
                    {!loading && seriesList.length === 0 && <option>No active series found</option>}
                    {seriesList.map(series => (
                      <option key={series.id} value={series.id}>{series.title}</option>
                    ))}
                 </select>
               </div>

               <div className="flex sm:flex-col gap-2">
                 <button
                   onClick={() => setActiveTab('send')}
                   className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 flex-1 sm:flex-none justify-center sm:justify-start ${
                     activeTab === 'send'
                       ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                       : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100 border border-transparent'
                   }`}
                 >
                   <Send size={18} />
                   <span className="font-medium text-sm">Send New</span>
                 </button>
                 <button
                   onClick={() => setActiveTab('history')}
                   className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 flex-1 sm:flex-none justify-center sm:justify-start ${
                     activeTab === 'history'
                       ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                       : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100 border border-transparent'
                   }`}
                 >
                   <History size={18} />
                   <span className="font-medium text-sm">History</span>
                 </button>
               </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
               {error && (
                 <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                   {error}
                 </div>
               )}
               {success && (
                 <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                   {success}
                 </div>
               )}

               {activeTab === 'send' ? (
                 <div className="flex flex-col h-full gap-4">
                       <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 shrink-0">
                        <div>
                           <h3 className="text-zinc-100 font-medium">Recordings Payload</h3>
                           <p className="text-sm text-zinc-400 mt-1">Add session drive links below.</p>
                        </div>
                        <button
                           onClick={handleAddRecording}
                           className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700"
                        >
                           <Plus size={16} /> Add 
                        </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[30vh] pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                       {recordings.map((rec, index) => (
                         <div key={index} className="flex gap-3 items-start">
                            <div className="w-24 shrink-0">
                               <label className="text-xs text-zinc-500 mb-1 block">Session #</label>
                               <input
                                 type="number"
                                 min="1"
                                 value={rec.sessionNumber}
                                 onChange={(e) => handleRecordingChange(index, 'sessionNumber', Number(e.target.value))}
                                 className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm outline-none focus:border-blue-500"
                               />
                            </div>
                            <div className="flex-1">
                               <label className="text-xs text-zinc-500 mb-1 block">Drive Link</label>
                               <div className="flex gap-2">
                                  <input
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={rec.driveLink}
                                    onChange={(e) => handleRecordingChange(index, 'driveLink', e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm outline-none focus:border-blue-500"
                                  />
                                  <button
                                     onClick={() => handleRemoveRecording(index)}
                                     disabled={recordings.length === 1}
                                     className="p-2 shrink-0 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
                                  >
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>

                    <hr className="border-zinc-800 my-4" />

                    <div className="shrink-0">
                       <label className="block text-sm font-medium text-zinc-300 mb-2">Custom Message (Optional)</label>
                       <textarea
                         value={customMessage}
                         onChange={(e) => setCustomMessage(e.target.value)}
                         placeholder="Add an optional message from the instructor..."
                         rows={2}
                         className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 text-sm outline-none focus:border-blue-500 resize-none"
                       />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-zinc-800 mt-auto shrink-0">
                       <div className="flex-1 flex gap-2">
                         <input
                           type="email"
                           placeholder="Student email address..."
                           value={studentEmail}
                           onChange={(e) => setStudentEmail(e.target.value)}
                           className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm outline-none focus:border-blue-500"
                         />
                         <button
                           onClick={handleSendToStudent}
                           disabled={isPending || !selectedSeriesId}
                           className="flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-900/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                         >
                           <Mail size={16} /> Send to Student
                         </button>
                       </div>
                       
                       <button
                         onClick={handleSendAll}
                         disabled={isPending || !selectedSeriesId}
                         className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg transition-colors disabled:opacity-50"
                       >
                         {isPending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />} 
                         {isPending ? 'Sending...' : 'Send to All Students'}
                       </button>
                    </div>

                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="text-zinc-100 font-medium text-lg">Send History</h3>
                       <button 
                         onClick={() => fetchHistory(selectedSeriesId)}
                         className="p-2 text-zinc-400 hover:text-white"
                         title="Refresh History"
                       >
                          <RefreshCw size={16} className={historyLoading ? 'animate-spin' : ''} />
                       </button>
                    </div>

                    {historyLoading ? (
                       <div className="text-center py-12 text-zinc-500 animate-pulse text-sm">Loading history...</div>
                    ) : history.length === 0 ? (
                       <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800/50 rounded-xl">
                          <History size={32} className="mx-auto text-zinc-600 mb-3" />
                          <p className="text-zinc-400 font-medium">No history found</p>
                          <p className="text-sm text-zinc-500">Recordings sent for this series will appear here.</p>
                       </div>
                    ) : (
                       <div className="space-y-3">
                          {history.map((item, idx) => (
                             <div key={idx} className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-3">
                                   <div>
                                     <p className="text-sm font-medium text-zinc-200">Sent on {new Date(item.sentAt).toLocaleString()}</p>
                                     <p className="text-xs text-zinc-500 font-mono mt-1">Batch ID: {item.batchId}</p>
                                   </div>
                                   <div className="text-right">
                                     <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-xs font-medium border border-green-500/20">
                                       <Users size={12} /> {item.totalRecipients} Recipients
                                     </span>
                                   </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                   {item.sessions.map((sess, i) => (
                                     <a 
                                       key={i} 
                                       href={sess.driveLink} 
                                       target="_blank" 
                                       rel="noreferrer"
                                       className="inline-flex items-center gap-1.5 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 px-2 py-1 rounded text-xs text-blue-400 transition-colors"
                                     >
                                        <Video size={12} /> Session {sess.sessionNumber}
                                     </a>
                                   ))}
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Minimal icon for Users since it's not imported above to save line space.
const Users = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
     <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
     <circle cx="9" cy="7" r="4" />
     <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
     <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
