'use client';

import { Check } from 'lucide-react';
import { UploadStep } from '@/types/videoUpload';

interface StepProgressTrackerProps {
  currentStep: UploadStep;
}

export function StepProgressTracker({ currentStep }: StepProgressTrackerProps) {
  const steps = [
    { number:1, label: 'Upload file', value: UploadStep.FILE_UPLOAD },
    { number:2,label: 'Details', value: UploadStep.VIDEO_DETAILS },
    { number:3,label: 'Video elements', value: UploadStep.VIDEO_ELEMENTS },
    { number:4,label: 'Visibility', value: UploadStep.VISIBILITY },
  ];

  const currentIndex = steps.findIndex((step) => step.value === currentStep);

  return (
    <div className="flex items-start md:items-center w-full justify-start">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <div key={step.value} className="flex items-center">
            {/* Left connector (always visible except before first) */}
            {index > 0 && (
              <div
                className={` w-2 md:w-8 h-0.5 border-t-2 border-dashed transition-colors duration-300
                  ${isCompleted ? 'border-violet-600' : 'border-[#6c6f76]'}
                `}
              />
            )}

            {/* Step pill */}
            <div
              className={`flex items-start md:items-center md:gap-2 rounded-full md:px-4 py-1.5 text-sm font-medium md:mx-2 transition-all duration-300
                ${
                  isCompleted
                    ? 'bg-transparent text-white'
                    : isActive
                    
                    ? 'md:bg-[#2f3037] text-white'
                    : 'text-[#6c6f76]'
                }
              `}
            >
              {isCompleted ? (
                <>
                  <span className='text-xs md:text-sm'>{step.label}</span>
                  <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                </>
              ) : isActive ? (
                <span className='text-xs md:text-sm'>{step.label}</span>
              )
              : (
                <span>{step.number}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
