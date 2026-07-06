'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import StarFilledIcon from '@/components/icons/StarFilledIcon';
import StarIcon from '@/components/icons/StarIcon';
import { feedbackService } from '@/services/feedbackService';

interface ShareFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ShareFeedbackModal({
  isOpen,
  onClose,
  onSuccess,
}: ShareFeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Close handler that resets state
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setRating(0);
      setHoveredRating(0);
      setCategory('general');
      setSubject('');
      setMessage('');
      setShowSuccess(false);
    }, 300); // Reset after closing animation
  };

  const handleSubmit = async () => {
    if (!message.trim() || rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        rating,
        category,
        subject,
        message
      });
      
      setShowSuccess(true);
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        handleClose();
      }, 3000); 
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
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
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background-darker rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/10 flex flex-col scrollbar-hide"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10 shrink-0">
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded transition-colors"
              aria-label="Close feedback form"
            >
              <ArrowLeftIcon className="w-4 h-4 text-white" />
            </button>
            <h1 className="text-lg font-medium text-white">Share Feedback</h1>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto scrollbar-hide">
            {showSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Thank you for your feedback!</h2>
                <p className="text-gray-400">We appreciate your input and will use it to improve the platform.</p>
                <button
                  onClick={handleClose}
                  className="mt-8 bg-white/10 hover:bg-white/20 text-white py-2 px-6 rounded-full transition-colors font-medium"
                >
                  Close
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  We are always looking for ways to improve your experience. Please take a moment to evaluate and tell us what you think.
                </p>

                <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-6">
                  {/* Rating Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      How would you rate your experience? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none transition-transform hover:scale-110"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          aria-label={`Rate ${star} stars`}
                        >
                          {(hoveredRating || rating) >= star ? (
                            <StarFilledIcon width={32} height={32} className="text-[#FBBF24]" />
                          ) : (
                            <StarIcon width={32} height={32} className="text-gray-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category & Subject Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-gray-400 focus:outline-none transition-colors appearance-none"
                      >
                        <option value="general">General</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature_request">Feature Request</option>
                        <option value="improvement">Improvement</option>
                        <option value="complaint">Complaint</option>
                        <option value="praise">Praise</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief title"
                        className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-gray-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      placeholder="What can we do to improve your experience?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full bg-black border border-gray-600 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:border-gray-400 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={handleClose}
                    className="hover:bg-white/10 text-white font-medium py-3 px-6 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!message.trim() || rating === 0 || isSubmitting}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-full transition-colors flex justify-center min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}