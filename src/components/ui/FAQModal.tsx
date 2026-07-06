'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Memoized FAQ Item Component
const FAQItemComponent = React.memo<{
  item: FAQItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}>(({ item, isExpanded, onToggle }) => {
  const handleToggle = useCallback(() => {
    onToggle(item.id);
  }, [item.id, onToggle]);

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={handleToggle}
        className="flex items-center justify-between w-full py-4 text-left hover:bg-white/5 transition-colors"
        aria-expanded={isExpanded}
      >
        <h3 className="text-base font-medium text-white pr-4">{item.question}</h3>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDownIcon className="w-5 h-5 text-white/60" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4 pr-8">
              <p className="text-sm text-gray-400 leading-relaxed">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FAQItemComponent.displayName = 'FAQItemComponent';

export const FAQModal = React.memo<FAQModalProps>(({ isOpen, onClose }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1'])); // First item expanded by default

  // Memoized FAQ data
  const faqData = useMemo<FAQItem[]>(() => [
    {
      id: '1',
      question: 'What is Hallos?',
      answer: 'Watching live interactive sessions has been a blast. It\'s a flexible way of learning, easy to understand and apply. It\'s a fun and effective way to level up my skills. It\'s refreshing to feel like I\'m picking up valuable insights in a fun and engaging way.'
    },
    {
      id: '2',
      question: 'Who is Hallos for?',
      answer: 'Hallos is designed for learners, creators, and educators who want to engage in interactive learning experiences. Whether you\'re looking to learn new skills or share your expertise, our platform provides the tools you need.'
    },
    {
      id: '3',
      question: 'How do I get started?',
      answer: 'Getting started is easy! Simply create an account, browse our available courses and live sessions, and join the ones that interest you. You can also create your own content and start teaching others.'
    },
    {
      id: '4',
      question: 'What features does Hallos offer?',
      answer: 'Hallos offers live interactive sessions, on-demand courses, real-time chat, screen sharing, collaborative tools, and much more. Our platform is designed to make learning engaging and effective.'
    },
    {
      id: '5',
      question: 'How much does it cost?',
      answer: 'We offer various pricing plans to suit different needs. You can start with our free tier to explore the platform, and upgrade to premium plans for additional features and unlimited access to content.'
    }
  ], []);

  // Memoized toggle handler
  const handleToggle = useCallback((id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Memoized close handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative bg-background-darker rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded transition-colors"
              aria-label="Close FAQ"
            >
              <ArrowLeftIcon className="w-4 h-4 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-medium text-white">FAQ</h1>
              <p className="text-sm text-gray-400">Frequently asked questions</p>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-0">
              {faqData.map((item) => (
                <FAQItemComponent
                  key={item.id}
                  item={item}
                  isExpanded={expandedItems.has(item.id)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

FAQModal.displayName = 'FAQModal';