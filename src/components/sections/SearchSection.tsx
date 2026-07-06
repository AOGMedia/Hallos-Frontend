'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import SearchIcon from '@/components/icons/SearchIcon';
import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollArrows } from '@/hooks/useScrollArrows';

interface TextProp {
  header1?: string;
  header2?: string;
  badges?: string[];
  showBadges?: boolean;
  onSearch?: (term: string) => void;
  onBadgeClick?: (badge: string) => void;
  selectedBadge?: string;
  badgeVariant?: 'wrap' | 'scroll';
  badgeLabel?: string;
  isLoading?: boolean;
}

const FREQUENT_SEARCHES = [
  'Technology', 'Import & Export', 'Graphics Design', 'Programming', 
  'Programming', 'Sports', 'Events', 'News', 'Gaming', 'Politics', 
  'Data Analysis', 'Agriculture'
];

export function SearchSection({ 
  header1, 
  header2, 
  badges, 
  showBadges = true,
  onSearch,
  onBadgeClick,
  selectedBadge,
  badgeVariant = 'wrap',
  badgeLabel = 'Frequently searched',
  isLoading = false
}: TextProp) {
  const [searchTerm, setSearchTerm] = useState('');
  const { scrollContainerRef, showLeftArrow, showRightArrow, scroll } = useScrollArrows({
    scrollAmount: 200,
    threshold: 1
  });

  const handleBadgeClick = (tag: string) => {
    if (onBadgeClick) {
      onBadgeClick(tag);
    } else {
      setSearchTerm(tag);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      if (searchTerm.trim()) {
        console.log('Searching for:', searchTerm);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const badgesToDisplay = badges || FREQUENT_SEARCHES;

  return (
    <section id='searchSection' className="py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-center mb-8 sm:mb-12 leading-tight">
          {header1} <span className="gradient-text">{header2}</span>
        </h2>
        
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 glass-effect rounded-lg hover:border-2 !border-primary ">
              <Input 
                placeholder="Search" 
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                icon={<SearchIcon width={20} height={20} color="#F2F2F2" />}
              />
            </div>
            
            <div className="glass-effect rounded-lg px-4 sm:px-6 py-3 flex items-center gap-3 cursor-pointer hover:border-2 !border-primary  hover:border-text-primary transition-colors">
              <span className="text-sm sm:text-base text-text-muted">Category</span>
              <ChevronDownIcon width={17} height={9} color="rgba(234, 234, 234, 0.5)" />
            </div>
            
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 min-w-[120px]"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                'Search'
              )}
            </Button>
          </div>
          
          {showBadges && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-muted">{badgeLabel}</p>
              
              {badgeVariant === 'scroll' ? (
                <div className="relative w-full">
                  {/* Left Arrow */}
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

                  <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                      onClick={() => handleBadgeClick('')}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        !selectedBadge
                          ? "bg-primary text-white"
                          : "bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      All
                    </button>
                    {badgesToDisplay.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => handleBadgeClick(tag)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedBadge === tag
                            ? "bg-primary text-white"
                            : "bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)]"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  {/* Right Arrow */}
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
              ) : (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {badgesToDisplay.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="tag" 
                      className={`text-sm cursor-pointer transition-colors ${
                        selectedBadge === tag 
                          ? 'bg-primary text-white border-primary' 
                          : 'hover:bg-primary/20'
                      }`} 
                      onClick={() => handleBadgeClick(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}