import { useRef, useState, useEffect, useCallback } from 'react';

export interface UseScrollArrowsOptions {
  scrollAmount?: number;
  threshold?: number;
}

export function useScrollArrows(options: UseScrollArrowsOptions = {}) {
  const { scrollAmount = 200, threshold = 1 } = options;
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Show left arrow if scrolled right
    setShowLeftArrow(scrollLeft > threshold);
    
    // Show right arrow if there's more content to scroll
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - threshold);
  }, [threshold]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    checkScroll();

    // Check on mount and when content changes
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(container);

    // Use passive listener for better performance
    const scrollHandler = () => {
      checkScroll();
    };
    
    container.addEventListener('scroll', scrollHandler, { passive: true });
    container.addEventListener('scrollend', scrollHandler, { passive: true } as AddEventListenerOptions);
    window.addEventListener('resize', checkScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', scrollHandler);
      container.removeEventListener('scrollend', scrollHandler);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  }, [scrollAmount]);

  return {
    scrollContainerRef,
    showLeftArrow,
    showRightArrow,
    scroll,
    checkScroll
  };
}
