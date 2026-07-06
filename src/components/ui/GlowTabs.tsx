import { memo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollArrows } from '@/hooks/useScrollArrows';

export interface TabOption {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface GlowTabsProps {
  tabs: TabOption[];
  activeTabId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const GlowTabs = memo(function GlowTabs({ 
  tabs, 
  activeTabId, 
  onChange,
  className = ''
}: GlowTabsProps) {
  const { scrollContainerRef, showLeftArrow, showRightArrow, scroll } = useScrollArrows({
    scrollAmount: 200,
    threshold: 1
  });

  return (
    <div className={cn('relative w-full', className)}>
      {/* Left Arrow - with higher z-index and pointer-events */}
      {showLeftArrow && (
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              scroll('left');
            }}
            className="w-12 h-full flex items-center justify-center bg-gradient-to-r from-[#0A0E1A] via-[#0A0E1A]/90 to-transparent hover:from-[#1a1f2e] transition-colors pointer-events-auto"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Tabs Container */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-6 md:gap-12 w-full overflow-x-auto scrollbar-hide px-4"
      >
        {tabs.map((tab, index) => {
          const isActive = activeTabId === tab.id;
          const isLast = index === tabs.length - 1;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative group flex items-center gap-[10px] px-5 py-[11px] rounded-full transition-all shrink-0 border cursor-pointer',
                isActive 
                  ? 'bg-[#6a57e5]/5 border-[#6a57e5]/20' 
                  : 'bg-white/5 border-white/10 hover:border-[#6a57e5]/40 hover:bg-[#6a57e5]/10',
                isLast && 'mr-4'
              )}
            >
              {/* Top glow line - only on active */}
              {isActive && (
                <span className="absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent via-[#6a57e5] to-transparent" />
              )}
              
              {tab.icon && (
                <div className="text-text-primary">
                  {tab.icon}
                </div>
              )}
              
              <span 
                className={cn(
                  'font-medium text-base leading-5 relative z-10 transition-colors',
                  isActive ? 'text-text-primary' : 'text-text-gray group-hover:text-text-primary/80'
                )}
              >
                {tab.label}
              </span>
              
              {/* Bottom glow line - always visible on active, appears on hover */}
              {isActive && (
                <span className="absolute group-hover:opacity-30 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-[#6a57e5] to-transparent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right Arrow - with higher z-index and pointer-events */}
      {showRightArrow && (
        <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              scroll('right');
            }}
            className="w-12 h-full flex items-center justify-center bg-gradient-to-l from-[#0A0E1A] via-[#0A0E1A]/90 to-transparent hover:from-[#1a1f2e] transition-colors pointer-events-auto"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
});
