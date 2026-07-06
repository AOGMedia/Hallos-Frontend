export interface CourseModule {
  id: string;
  title: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  price?: string;
  thumbnail: string;
  imageUrl?: string | null; // Real course image from API
  enrolled: string;
  duration: string;
  type: 'Certification' | 'Specialization' | 'Subscription';
  rating: string;
  ratingCount: string;
  description: string;
  variant?: 'default' | 'compact';
  fullDescription?: string;
  benefits?: string[];
  whoShouldTake?: {
    title: string;
    content: string;
  };
  certification?: {
    title: string;
    content: string;
  };
  learningOutcomes?: {
    title: string;
    content: string;
  };
  assessment?: {
    title: string;
    content: string;
  };
  modules?: CourseModule[];
}

// Mock data removed - all course data now comes from API
// Only keeping TypeScript interfaces for type safety
