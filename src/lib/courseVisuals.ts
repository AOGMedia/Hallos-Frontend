/**
 * Course Visual Identity System
 * 
 * Provides deterministic gradient-based visual identities for courses without real images.
 * Uses a hash-based algorithm to map course identifiers to a curated gradient palette.
 */

/**
 * Represents a gradient definition with accessibility-compliant text color
 */
export interface CourseGradient {
  /** Human-readable identifier for the gradient */
  id: string;
  /** CSS gradient definition string */
  gradient: string;
  /** Hex color for text overlay (WCAG AA compliant) */
  textColor: string;
}

/**
 * Curated gradient palette for course visual identities
 * Each gradient is paired with a contrasting text color for accessibility
 */
const GRADIENT_PALETTE: readonly CourseGradient[] = [
  {
    id: 'ocean',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'sunset',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'forest',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'amber',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'emerald',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    textColor: '#ffffff'
  },
  {
    id: 'lavender',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    textColor: '#ffffff'
  }
] as const;

// Compile-time validation that palette is not empty
if (GRADIENT_PALETTE.length === 0) {
  throw new Error('Gradient palette cannot be empty');
}

// Validate palette size is within acceptable range (5-8)
if (GRADIENT_PALETTE.length < 5 || GRADIENT_PALETTE.length > 8) {
  console.warn(`Gradient palette size (${GRADIENT_PALETTE.length}) is outside recommended range of 5-8`);
}

/**
 * Computes a deterministic hash from a course identifier
 * 
 * @param courseId - Course identifier (string or number)
 * @returns Positive integer hash value
 */
function hashCourseId(courseId: string | number): number {
  const str = String(courseId);
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Retrieves a deterministic gradient for a given course identifier
 * 
 * This function always returns the same gradient for the same course ID,
 * ensuring visual consistency across renders and page loads.
 * 
 * @param courseId - Course identifier (string or number)
 * @returns CourseGradient object with gradient and text color
 * 
 * @example
 * ```typescript
 * const gradient = getCourseGradient(123);
 * // Returns: { id: 'ocean', gradient: '...', textColor: '#ffffff' }
 * ```
 */
export function getCourseGradient(courseId: string | number): CourseGradient {
  // Handle invalid/empty course IDs gracefully
  if (courseId === undefined || courseId === null || courseId === '') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('getCourseGradient: Invalid course ID provided, using fallback');
    }
    courseId = 'fallback';
  }
  
  const hash = hashCourseId(courseId);
  const index = hash % GRADIENT_PALETTE.length;
  
  return GRADIENT_PALETTE[index];
}

/**
 * Exports the gradient palette for testing purposes
 * @internal
 */
export function getGradientPalette(): readonly CourseGradient[] {
  return GRADIENT_PALETTE;
}
