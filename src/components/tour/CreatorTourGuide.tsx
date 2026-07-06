"use client";

import { useState, useEffect } from 'react';
import { X, ArrowRight, Users, Upload, Play, DollarSign, BarChart3, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
}

const CREATOR_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Discover how to share your expertise and build your audience on Hallos. From content creation to monetization, we\'ll guide you through every step.',
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: 'content-creation',
    title: 'Create Your Content',
    description: 'Upload videos or go live instantly. Our platform supports both pre-recorded content and real-time streaming with professional tools.',
    icon: <Upload className="w-6 h-6" />,
  },
  {
    id: 'live-streaming',
    title: 'Host Live Classes',
    description: 'Engage with your audience in real-time. Schedule classes,invite attendees,earn as you stream.',
    icon: <Play className="w-6 h-6" />,
  },
  {
    id: 'monetization',
    title: 'Monetize Your Knowledge',
    description: 'Set prices for your content, and earn from your expertise.',
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    id: 'audience-management',
    title: 'Manage Your Audience',
    description: 'Track attendees, manage invitations, and build a community around your content. See who\'s engaged and growing your reach.',
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: 'analytics',
    title: 'Track Your Success',
    description: 'Monitor your earnings, view earning statistics, and understand your audience growth through comprehensive analytics.',
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    id: 'professional-tools',
    title: 'Professional Broadcasting',
    description: 'stream  with professional-grade video quality for your live classes.',
    icon: <Settings className="w-6 h-6" />,
  },
  {
    id: 'get-started',
    title: 'Ready to Get Started?',
    description: 'You\'re all set to begin your creator journey! Start by creating your first piece of content and sharing your expertise with the world.',
    icon: <Play className="w-6 h-6" />,
    action: {
      label: 'Get Started',
      href: '/signup'
    }
  }
];

interface CreatorTourGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

// Reusable components for DRY principle
const StepIndicator = ({ 
  index, 
  currentStep, 
  isActive, 
  onClick 
}: { 
  index: number; 
  currentStep: number; 
  isActive: boolean; 
  onClick: () => void; 
}) => (
  <button
    onClick={onClick}
    className={`
      w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300
      ${isActive 
        ? 'bg-[#6366F1] text-white opacity-100' 
        : index < currentStep 
          ? 'bg-[#6366F1]/20 text-white/20 opacity-30' 
          : 'bg-[#374151] text-[#9CA3AF] border border-[#4B5563] opacity-100'
      }
    `}
  >
    {isActive ? index + 1 : ''}
  </button>
);

const ProgressLine = ({ 
  isCompleted
}: { 
  isCompleted: boolean;
}) => (
  <div className="flex items-center justify-center flex-1 px-1 sm:px-2">
    <div className="flex items-center w-full">
      {/* Dashed line */}
      <div className="flex-1 flex items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`
              h-0.5 flex-1 mx-0.5 transition-all duration-300
              ${isCompleted 
                ? 'bg-[#6366F1]/20 opacity-30' 
                : 'bg-[#4B5563] opacity-100'
              }
            `}
          />
        ))}
      </div>
      {/* Arrow */}
      <ArrowRight 
        className={`
          w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 transition-all duration-300
          ${isCompleted 
            ? 'text-[#6366F1]/20 opacity-30' 
            : 'text-[#4B5563] opacity-100'
          }
        `} 
      />
    </div>
  </div>
);

const NavigationButton = ({ 
  onClick, 
  disabled, 
  variant, 
  children 
}: { 
  onClick: () => void; 
  disabled?: boolean; 
  variant: 'previous' | 'next'; 
  children: React.ReactNode; 
}) => {
  const baseClasses = "px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 rounded-full font-semibold transition-all duration-200 min-w-[100px] sm:min-w-[120px] text-sm sm:text-base";
  
  if (variant === 'previous') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          ${baseClasses}
          ${disabled 
            ? 'bg-transparent border border-[#4B5563] text-[#6B7280] cursor-not-allowed' 
            : 'bg-transparent border border-[#4B5563] text-white hover:border-[#6B7280] hover:bg-[#374151]/20'
          }
        `}
      >
        {children}
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      className={`
        ${baseClasses}
        bg-[#6366F1] text-white hover:bg-[#5B5CF6] flex items-center justify-center gap-2
      `}
    >
      {children}
    </button>
  );
};

export function CreatorTourGuide({ isOpen, onClose }: CreatorTourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStepData = CREATOR_TOUR_STEPS[currentStep];
  const isLastStep = currentStep === CREATOR_TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const transition = {
    x: { type: "spring" as const, stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative w-full max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-[#1F2937] rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="relative pt-6 pb-4 px-4 sm:pt-8 sm:pb-6 sm:px-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-[#9CA3AF] hover:text-white transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* User Icon */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#374151] rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#9CA3AF]" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8">
            Become a Creator
          </h1>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
            <div className="flex items-center min-w-max px-2">
              {CREATOR_TOUR_STEPS.map((_, index) => (
                <div key={index} className="flex items-center">
                  <StepIndicator
                    index={index}
                    currentStep={currentStep}
                    isActive={index === currentStep}
                    onClick={() => handleStepClick(index)}
                  />
                  {index < CREATOR_TOUR_STEPS.length - 1 && (
                    <ProgressLine
                      isCompleted={index < currentStep}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 sm:px-8 sm:pb-8">
          <div className="relative overflow-hidden min-h-[180px] sm:min-h-[200px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="text-center"
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                  {currentStepData.title}
                </h2>
                <p className="text-[#D1D5DB] text-base sm:text-lg leading-relaxed max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                  {currentStepData.description}
                </p>

                {/* Action Button */}
                {currentStepData.action && (
                  <div className="flex justify-center mb-6 sm:mb-8">
                    <a
                      href={currentStepData.action.href}
                      className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-[#6366F1] text-white rounded-full hover:bg-[#5B5CF6] transition-colors font-semibold text-sm sm:text-base"
                      onClick={onClose}
                    >
                      {currentStepData.action.label}
                    </a>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 sm:pt-8 gap-4">
            <NavigationButton
              onClick={handlePrevious}
              disabled={isFirstStep}
              variant="previous"
            >
              Previous
            </NavigationButton>

{!isLastStep && (
            <NavigationButton
              onClick={handleNext}
              variant="next"
            >
              {isLastStep ? 'Get Started' : (
                <>
                  Next <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  
                </>
              )}
            </NavigationButton>
)}
          </div>
        </div>
      </div>
    </div>
  );
}