/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback } from 'react';
import { X, ArrowLeft, ArrowRight, Globe, Lock, Loader2, Users, Briefcase, GraduationCap, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunityStore } from '@/store/communityStore';
import { UploadStep1 } from '@/components/freebies/upload/UploadStep1';
import { useCreateCommunity } from '@/hooks/useCommunityAPI';
import type { CreateCommunityPayload } from '@/lib/api/community';

const STEP_LABELS = ['Upload poster', 'Details', 'Settings'];

const COMMUNITY_TYPES = [
  { value: 'general', label: 'General', icon: Grid },
  { value: 'school', label: 'School', icon: GraduationCap },
  { value: 'association', label: 'Association', icon: Users },
  { value: 'committee', label: 'Committee', icon: Briefcase },
];

export function CreateCommunityModal() {
  const { isCreateModalOpen, createStep, closeCreate, nextCreateStep, prevCreateStep } = useCommunityStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('general');
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinPolicy, setJoinPolicy] = useState<'request' | 'invite_only'>('request');
  const [image, setImage] = useState<File | null>(null);
  
  const createMutation = useCreateCommunity();

  const handleImageSelected = (files: File[]) => {
    if (files[0]) { setImage(files[0]); nextCreateStep(); }
  };

  const canNext = createStep === 2 ? name.trim().length > 0 : true;

  const resetForm = useCallback(() => {
    setName(''); 
    setDescription(''); 
    setType('general');
    setIsPrivate(false);
    setJoinPolicy('request');
    setImage(null);
  }, []);

  const handleClose = useCallback(() => {
    closeCreate();
    resetForm();
    createMutation.reset();
  }, [closeCreate, resetForm, createMutation]);

  const handleNext = () => {
    if (createStep === 3) {
      const payload: CreateCommunityPayload = {
        name,
        description,
        type,
        visibility: isPrivate ? 'private' : 'public',
        joinPolicy: isPrivate ? joinPolicy : undefined,
      };
      
      if (image) {
        payload.poster = image;
      }

      createMutation.mutate(payload, {
        onSuccess: () => {
          handleClose();
        },
        onError: (err) => {
          console.error('Failed to create community:', err);
          // Could add toast notification here in the future
        }
      });
    } else {
      nextCreateStep();
    }
  };

  return (
    <AnimatePresence>
      {isCreateModalOpen && (
        <motion.div
          // Phones: a sheet docked to the bottom edge. Larger screens: centred.
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 sm:items-center sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-background-dark sm:max-h-[95vh] sm:max-w-[700px] sm:gap-10 sm:overflow-visible sm:rounded-none sm:bg-transparent"
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }} transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* Grab handle (phones) */}
            <div className="flex shrink-0 justify-center pt-2.5 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            <div className="flex shrink-0 items-center gap-2.5 px-4 pb-2 pt-2 sm:p-0 sm:px-2">
              {createStep > 1 && !createMutation.isPending && (
                <button onClick={prevCreateStep} aria-label="Back"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-text-gray transition-colors hover:text-text-primary active:bg-white/10 touch-manipulation sm:h-auto sm:w-auto">
                  <ArrowLeft size={19} />
                </button>
              )}
              <h2 className="flex-1 text-lg font-semibold text-text-primary sm:text-3xl sm:font-medium sm:text-text-primary/60">Create community</h2>
              {!createMutation.isPending && (
                <button onClick={handleClose} aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-text-primary active:scale-90 touch-manipulation sm:hidden">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-6 overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),20px)] pt-2 sm:gap-10 sm:rounded-[40px] sm:bg-background-dark sm:p-10">
              {/* Progress — compact on phones so all three steps fit */}
              <div className="flex items-center gap-2 sm:gap-4">
                {STEP_LABELS.map((label, idx) => {
                  const step = idx + 1;
                  const isActive = step <= createStep;
                  return (
                    <div key={label} className="flex items-center gap-2 sm:gap-4">
                      <span className={`whitespace-nowrap text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 rounded-full transition-colors ${step === createStep ? 'bg-white/20 text-text-primary' : isActive ? 'text-text-primary' : 'text-text-gray'}`}>
                        {label}
                      </span>
                      {idx < STEP_LABELS.length - 1 && (
                        <div className="border-t-2 border-dashed border-text-gray/40 w-3 sm:w-8" />
                      )}
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={createStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  {createStep === 1 && <UploadStep1 onFilesSelected={handleImageSelected} />}

                  {createStep === 2 && (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary">Community name *</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. UNILAG Online Tutorials"
                          className="live-event-input text-text-primary text-base sm:text-sm placeholder-text-muted/60 w-full outline-none focus:border-primary transition-colors" />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary">Community type *</label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mt-1">
                          {COMMUNITY_TYPES.map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              onClick={() => setType(value)}
                              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-colors ${
                                type === value 
                                  ? 'border-primary bg-primary/10 text-primary' 
                                  : 'border-white/5 bg-white/5 text-text-gray hover:border-white/10 hover:text-text-primary'
                              }`}
                            >
                              <Icon size={24} />
                              <span className="text-xs font-medium">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="What is this community about?"
                          className="live-event-input text-text-primary text-base sm:text-sm placeholder-text-muted/60 w-full outline-none resize-none focus:border-primary transition-colors" />
                      </div>
                    </div>
                  )}

                  {createStep === 3 && (
                    <div className="flex flex-col gap-8">
                      <div className="flex flex-col gap-4">
                        <p className="text-sm font-medium text-text-primary">Privacy settings</p>
                        {[
                          { value: false, icon: Globe, label: 'Public', desc: 'Anyone can find and join this community' },
                          { value: true, icon: Lock, label: 'Private', desc: 'Members must request to join or be invited' },
                        ].map(({ value, icon: Icon, label, desc }) => (
                          <button key={label} onClick={() => setIsPrivate(value)}
                            className={`radio-option-card ${isPrivate === value ? 'radio-option-card-selected' : ''}`}>
                            <div className="flex items-center gap-3">
                              <Icon size={18} className={isPrivate === value ? 'text-primary' : 'text-text-gray'} />
                              <div className="text-left">
                                <p className="text-sm font-semibold text-text-primary">{label}</p>
                                <p className="text-xs text-text-gray">{desc}</p>
                              </div>
                            </div>
                            <div className={`radio-button ${isPrivate === value ? 'radio-button-selected' : ''}`}>
                              {isPrivate === value && <div className="radio-button-inner" />}
                            </div>
                          </button>
                        ))}
                      </div>

                      {isPrivate && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          className="flex flex-col gap-4"
                        >
                          <p className="text-sm font-medium text-text-primary">Join Policy</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { value: 'request', label: 'By Request', desc: 'Users can request to join' },
                              { value: 'invite_only', label: 'Invite Only', desc: 'Only invited users can join' }
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => setJoinPolicy(opt.value as any)}
                                className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-colors text-left ${
                                  joinPolicy === opt.value
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-white/5 bg-white/5 hover:border-white/10'
                                }`}
                              >
                                <span className={`text-sm font-medium ${joinPolicy === opt.value ? 'text-primary' : 'text-text-primary'}`}>
                                  {opt.label}
                                </span>
                                <span className="text-xs text-text-gray">{opt.desc}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {createMutation.isError && (
                        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                          {createMutation.error?.message || 'An error occurred while creating the community.'}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {createStep !== 1 && (
                <button onClick={handleNext} disabled={!canNext || createMutation.isPending}
                  className="flex w-full items-center justify-center gap-2 px-6 py-4 rounded-full bg-primary text-white font-bold disabled:opacity-50 hover:bg-primary/90 active:scale-[0.98] transition touch-manipulation sm:w-auto sm:self-start">
                  {createMutation.isPending ? (
                    <>
                      <span>Creating</span>
                      <Loader2 size={18} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>{createStep === 3 ? 'Create community' : 'Next'}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}
            </div>

            {!createMutation.isPending && (
              <button onClick={handleClose} aria-label="Close" className="absolute -top-2 right-0 hidden p-2 text-text-gray hover:text-text-primary transition-colors sm:block">
                <X size={22} />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
