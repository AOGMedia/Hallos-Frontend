'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon';

const ChatPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsTyping(true);
    
    // Simulate bot typing delay
    setTimeout(() => {
      setIsTyping(false);
      // Here you can add logic to show bot response or navigate to detailed chat
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-8 h-8 hover:bg-white/10 rounded transition-colors"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="w-4 h-4 text-white" />
        </button>
        <h1 className="text-lg font-medium text-white">Hallos chatbot</h1>
      </div>

      {/* Subtitle */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-400">
          Ask anything or share your feedback about Hallos.
        </p>
      </div>

      {/* Chat Messages */}
      <div className="px-4 py-4 space-y-4">
        {/* Bot Welcome Message */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
          </div>
          <div className="bg-[#2a2a2a] rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs">
            <p className="text-sm text-white">
              Welcome to Hallos support! How can we help you?
            </p>
          </div>
        </div>

        {/* Selected Category Message */}
        {selectedCategory && (
          <div className="flex justify-end">
            <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs flex items-center gap-2">
              <span className="text-sm text-white">{selectedCategory}</span>
              <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
            </div>
            <div className="bg-[#2a2a2a] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Selection */}
      {!selectedCategory && (
        <div className="px-4 pb-6">
          {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => handleCategorySelect('Technology')}
              className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-full px-4 py-2 text-sm text-primary hover:bg-[#2a2a4a] transition-colors"
            >
              Technology
            </button>
            <button
              onClick={() => handleCategorySelect('Import & Export')}
              className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-full px-4 py-2 text-sm text-primary hover:bg-[#2a2a4a] transition-colors"
            >
              Import & Export
            </button>
            <button
              onClick={() => handleCategorySelect('Graphics Design')}
              className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-full px-4 py-2 text-sm text-primary hover:bg-[#2a2a4a] transition-colors"
            >
              Graphics Design
            </button>
            <button
              onClick={() => handleCategorySelect('Programming')}
              className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-full px-4 py-2 text-sm text-primary hover:bg-[#2a2a4a] transition-colors"
            >
              Programming
            </button>
            <button
              onClick={() => handleCategorySelect('Sports')}
              className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-full px-4 py-2 text-sm text-primary hover:bg-[#2a2a4a] transition-colors"
            >
              Sports
            </button>
            <button
              onClick={() => handleCategorySelect('Events')}
              className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-full px-4 py-2 text-sm text-primary hover:bg-[#2a2a4a] transition-colors"
            >
              Events
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;