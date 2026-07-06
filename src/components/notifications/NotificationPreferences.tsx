'use client';

import axios from 'axios';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  Save, 
  RotateCcw, 
  UserCog
} from 'lucide-react';
import { ToggleSwitch } from '@/components/videoUpload/ToggleSwitch';
import { FrequencySelector, type Frequency } from './FrequencySelector';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  type NotificationPreferences as Preferences 
} from '@/lib/api/notification';

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [initialPreferences, setInitialPreferences] = useState<Preferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch initial preferences
  useEffect(() => {
    async function fetchPrefs() {
      try {
        const data = await getNotificationPreferences();
        setPreferences(data);
        setInitialPreferences(data);
      } catch (err) {
        console.error('Failed to fetch preferences:', err);
        setError('Failed to load preferences. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrefs();
  }, []);

  // Derived state: Is the form dirty?
  const isDirty = useMemo(() => {
    if (!preferences || !initialPreferences) return false;
    return (
      preferences.instantLiveClassEmails !== initialPreferences.instantLiveClassEmails ||
      preferences.dailyDigestEmails !== initialPreferences.dailyDigestEmails ||
      preferences.weeklyDigestEmails !== initialPreferences.weeklyDigestEmails ||
      preferences.allowCreatorRelatedOnly !== initialPreferences.allowCreatorRelatedOnly ||
      preferences.disableAllEmails !== initialPreferences.disableAllEmails
    );
  }, [preferences, initialPreferences]);

  // Derived state: Current frequency
  const currentFrequency = useMemo((): Frequency => {
    if (!preferences) return 'none';
    if (preferences.dailyDigestEmails && preferences.weeklyDigestEmails) return 'both';
    if (preferences.dailyDigestEmails) return 'daily';
    if (preferences.weeklyDigestEmails) return 'weekly';
    return 'none';
  }, [preferences]);

  // Validation: Select at least one or disable all
  const isValid = useMemo(() => {
    if (!preferences) return true;
    if (preferences.disableAllEmails) return true;
    return (
      preferences.instantLiveClassEmails ||
      preferences.dailyDigestEmails ||
      preferences.weeklyDigestEmails
    );
  }, [preferences]);

  // Handlers
  const handleToggle = useCallback((field: keyof Preferences, value: boolean) => {
    setPreferences(prev => prev ? { ...prev, [field]: value } : null);
    setError(null);
  }, []);

  const handleFrequencyChange = useCallback((freq: Frequency) => {
    setPreferences(prev => {
      if (!prev) return null;
      let daily = false;
      let weekly = false;
      if (freq === 'daily' || freq === 'both') daily = true;
      if (freq === 'weekly' || freq === 'both') weekly = true;
      return { ...prev, dailyDigestEmails: daily, weeklyDigestEmails: weekly };
    });
    setError(null);
  }, []);

  const handleDiscard = useCallback(() => {
    setPreferences(initialPreferences);
    setError(null);
  }, [initialPreferences]);

  const handleSave = useCallback(async () => {
    if (!preferences || !isValid) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await updateNotificationPreferences({
        instantLiveClassEmails: preferences.instantLiveClassEmails,
        dailyDigestEmails: preferences.dailyDigestEmails,
        weeklyDigestEmails: preferences.weeklyDigestEmails,
        allowCreatorRelatedOnly: preferences.allowCreatorRelatedOnly,
        disableAllEmails: preferences.disableAllEmails,
      });

      if (response.success) {
        setInitialPreferences(response.data);
        setPreferences(response.data);
        setSuccessMessage('Preferences saved successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || 'Failed to update preferences');
      }
    } catch (err: unknown) {
      console.error('Save error:', err);
      let errorMessage = 'A server error occurred while saving.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [preferences, isValid]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-text-muted animate-pulse">Loading preferences...</p>
      </div>
    );
  }

  if (!preferences) return null;

  const isDisabled = preferences.disableAllEmails;

  return (
    <div className="relative pb-24">
      <div className="space-y-8 max-w-2xl">
        {/* Header section optionally here, but usually in page.tsx */}
        
        {/* Master Email Switch */}
        <section className="bg-white/5 border border-white/10 rounded-[32px] p-6 sm:p-8 transition-all hover:bg-white/[0.07]">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Mail size={20} />
                </div>
                <h2 className="text-lg font-semibold text-text-primary">Email Notifications</h2>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Receive email updates from the platform. You won’t receive any emails including live alerts and digests if disabled.
              </p>
            </div>
            <ToggleSwitch 
              checked={!preferences.disableAllEmails} 
              onChange={(checked) => handleToggle('disableAllEmails', !checked)} 
            />
          </div>
        </section>

        {/* Settings Group */}
        <div className={`space-y-8 transition-all duration-300 ${isDisabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
          
          {/* Real-Time Alerts */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Real-Time Alerts</h3>
            </div>
            <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Live Class Alerts</p>
                <p className="text-xs text-text-muted">Get notified immediately when relevant live classes are created.</p>
              </div>
              <ToggleSwitch 
                checked={preferences.instantLiveClassEmails} 
                onChange={(checked) => handleToggle('instantLiveClassEmails', checked)}
                disabled={isDisabled}
              />
            </div>
          </section>

          {/* Digest Frequency */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Digest Frequency</h3>
            </div>
            <FrequencySelector 
              value={currentFrequency} 
              onChange={handleFrequencyChange}
              disabled={isDisabled}
            />
          </section>

          {/* Personalization */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <UserCog size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-text-primary">Personalization</h3>
            </div>
            <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-text-primary">Prioritize My Creators</p>
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold tracking-wider uppercase">Recommended</span>
                </div>
                <p className="text-xs text-text-muted">Only notify me about creators I’ve interacted with.</p>
              </div>
              <ToggleSwitch 
                checked={preferences.allowCreatorRelatedOnly} 
                onChange={(checked) => handleToggle('allowCreatorRelatedOnly', checked)}
                disabled={isDisabled}
              />
            </div>
          </section>

          {/* Preview Summary */}
          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
            <p className="text-xs font-bold text-primary mb-3 uppercase tracking-widest">Your Weekly Summary</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${preferences.instantLiveClassEmails ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text-muted'}`}>
                  {preferences.instantLiveClassEmails ? <Check size={10} /> : <X size={10} />}
                </div>
                <span className={preferences.instantLiveClassEmails ? 'text-text-primary' : 'text-text-muted'}>Instant live class alerts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${preferences.dailyDigestEmails ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text-muted'}`}>
                  {preferences.dailyDigestEmails ? <Check size={10} /> : <X size={10} />}
                </div>
                <span className={preferences.dailyDigestEmails ? 'text-text-primary' : 'text-text-muted'}>Daily summaries</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${preferences.weeklyDigestEmails ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text-muted'}`}>
                  {preferences.weeklyDigestEmails ? <Check size={10} /> : <X size={10} />}
                </div>
                <span className={preferences.weeklyDigestEmails ? 'text-text-primary' : 'text-text-muted'}>Weekly digests</span>
              </div>
            </div>
          </section>
        </div>

        {/* Validation Error Inline */}
        <AnimatePresence>
          {!isValid && !isDisabled && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400"
            >
              <AlertCircle size={18} />
              <p className="text-sm">Select at least one notification type or disable all emails.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* API Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400"
            >
              <AlertCircle size={18} />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Footer */}
      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-4 rounded-full bg-[#1F2636] border border-white/10 shadow-2xl backdrop-blur-md"
          >
            <div className="hidden sm:flex flex-col pr-4 border-r border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">Safe State</span>
              <span className="text-xs text-text-primary font-medium italic">Unsaved changes...</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDiscard}
                className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors px-4 py-2"
              >
                Discard
              </button>
              <button
                disabled={isSaving || !isValid}
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-8 left-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500 text-white shadow-xl"
          >
            <Check size={18} strokeWidth={3} />
            <span className="text-sm font-bold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
