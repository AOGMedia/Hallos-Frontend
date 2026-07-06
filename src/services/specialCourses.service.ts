import { apiClient } from '@/lib/api/client';
import type { Course as UICourse } from '@/data/specialCourses';

// API Response Interfaces
interface Department {
  id: string; // Changed to string (uuid)
  name: string;
  slug: string;
  description?: string; // Added description
  createdAt?: string;
  updatedAt?: string;
}

interface APICourse {
  id: string; // Changed to string (uuid)
  userId?: number; // From enrollments
  courseId?: string; // From enrollments
  purchaseId?: string; // From enrollments
  studentName?: string; // From enrollments
  studentEmail?: string; // From enrollments
  studentPhone?: string; // From enrollments
  accessType?: 'individual' | 'monthly' | 'yearly'; // From enrollments
  expiresAt?: string | null; // From enrollments
  isExpired?: boolean; // From enrollments
  daysUntilExpiry?: number | null; // From enrollments
  accessDescription?: string; // From enrollments
  credentialsSent?: boolean; // From enrollments

  departmentId?: string;
  name: string; // Course name
  link?: string;
  content: string; // Description
  curriculum?: string;
  duration?: string;
  imageUrl?: string;
  isActive?: boolean;
    
  // Pricing is no longer directly on the course object in all responses, 
  // but might be needed if the API returns it in some contexts. 
  // For now keeping it optional or handled via purchase flow.
  priceUsd?: number; 
  priceNgn?: number;

  department?: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  
  // For enrollment objects that contain course details
  course?: APICourse;
  purchase?: {
    id: string;
    amount: number;
    currency: string;
    paymentGateway: string;
    createdAt: string;
  };
}

interface GetDepartmentsResponse {
  success: boolean;
  count?: number;
  departments: Department[];
}

interface GetCoursesResponse {
  success: boolean;
  department?: Department;
  courses: APICourse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

interface GetCourseDetailsResponse {
  success: boolean;
  course: APICourse;
}

interface SearchCoursesResponse {
  success: boolean;
  query: string;
  courses: APICourse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

interface PurchasePayload {
  accessType: 'individual' | 'monthly' | 'yearly';
  courseId?: string; // Required for individual
  currency: string;
  couponCode?: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
}

interface PurchaseResponse {
  success: boolean;
  message: string;
  accessType?: string;
  accessDescription?: string;
  pricing?: {
      currency: string;
      regularPrice: number;
      finalPrice: number;
      discount: number;
      discountPercentage: number;
      couponApplied: boolean;
  };
  payment?: {
    gateway: string;
    requiredGateway: string;
    cached: boolean;
    paymentUrl: string;
    reference: string;
  };
  course?: {
      id: string;
      name: string;
      department: string;
  };
}

interface Enrollment {
  id: string;
  userId: number;
  courseId: string | null;
  purchaseId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  accessType: 'individual' | 'monthly' | 'yearly';
  expiresAt: string | null;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  accessDescription: string;
  credentialsSent: boolean;
  sentBy?: number;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  course: APICourse | null;
  purchase: {
    id: string;
    amount: number;
    currency: string;
    paymentGateway: string;
    createdAt: string;
  };
}

interface GetEnrollmentsResponse {
  success: boolean;
  enrollments: Enrollment[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

/**
 * Hash function to generate consistent "random" values from course ID
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate deterministic enrollment count based on course ID
 */
function generateEnrollmentCount(courseId: string): string {
  const hash = hashString(courseId);
  const count = 50 + (hash % 950); // Range: 50-999
  return `${count} enrolled`;
}

/**
 * Generate deterministic rating based on course ID
 */
function generateRating(courseId: string): string {
  const hash = hashString(courseId);
  const rating = 4.0 + (hash % 11) / 10; // Range: 4.0-5.0
  return rating.toFixed(1);
}

/**
 * Generate deterministic rating count based on course ID
 */
function generateRatingCount(courseId: string): string {
  const hash = hashString(courseId);
  const count = 50 + (hash % 450); // Range: 50-499
  return `${count}`;
}

/**
 * Adapter to convert API Course (or Enrollment) to UI Course
 */
const mapApiCourseToUiCourse = (data: APICourse | Enrollment, preferredCurrency: 'USD' | 'NGN' = 'NGN'): UICourse => {
  // Determine if it's an enrollment or a direct course object
  const isEnrollment = 'accessType' in data && 'purchaseId' in data;
  
  const courseData = isEnrollment ? (data as Enrollment).course : (data as APICourse);
  
  // If it's an enrollment without course data (e.g. monthly sub), handle gracefully
  if (!courseData && isEnrollment) {
      // Return a placeholder or special card for subscription
      return {
          id: (data as Enrollment).id,
          title: (data as Enrollment).accessDescription || 'Subscription',
          price: '',
          thumbnail: '',
          imageUrl: null,
          enrolled: 'Active',
          duration: (data as Enrollment).daysUntilExpiry ? `${(data as Enrollment).daysUntilExpiry} days left` : 'Active',
          type: 'Subscription',
          rating: '',
          ratingCount: '',
          description: 'All-Access Subscription',
          fullDescription: '',
          modules: [],
          variant: 'default'
      };
  }

  if (!courseData) return {} as UICourse; // Should not happen based on API

  // Parse curriculum string into modules
  const modules = courseData.curriculum
    ? courseData.curriculum.split('\n').map((line, index) => {
        const parts = line.split(':');
        const title = parts.length > 1 ? parts[0].trim() + ': ' + parts[1].trim() : `Module ${index + 1}`;
        const description = parts.length > 2 ? parts.slice(2).join(':').trim() : (parts.length > 1 ? parts.slice(1).join(':').trim() : line);
        
        return {
          id: `m${index}`,
          title: title,
          description: description || line 
        };
      })
    : [];

  // Format price - API doesn't return price on listing/details anymore, 
  // so we might default to checking on purchase or rely on what's available.
  // For now, if price exists (legacy or added back), use it.
  const price = preferredCurrency === 'USD' && courseData.priceUsd
    ? `$${courseData.priceUsd}`
    : courseData.priceNgn ? `₦${courseData.priceNgn.toLocaleString()}` : '';

  // Use imageUrl from API if available
  const imageUrl = courseData.imageUrl && courseData.imageUrl.trim() !== '' 
    ? courseData.imageUrl 
    : null;
  
  // Generate deterministic enrollment count and rating based on course ID
  const enrolled = generateEnrollmentCount(courseData.id);
  const rating = generateRating(courseData.id);
  const ratingCount = generateRatingCount(courseData.id);
    
  return {
    id: courseData.id,
    title: courseData.name,
    price,
    thumbnail: '', // Deprecated
    imageUrl, 
    enrolled,
    duration: courseData.duration || '',
    type: 'Certification',
    rating,
    ratingCount,
    description: courseData.content,
    fullDescription: courseData.content,
    modules: modules,
    variant: 'default'
  };
};


export const specialCoursesService = {
  getDepartments: async (): Promise<Department[]> => {
    try {
      const res = await apiClient.get<GetDepartmentsResponse>('/api/courses/departments');
      return res.data.departments;
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return [];
    }
  },

  getCoursesByDepartment: async (deptId: number | string, limit = 50, offset = 0, currency: 'USD' | 'NGN' = 'NGN'): Promise<UICourse[]> => {
    try {
      const res = await apiClient.get<GetCoursesResponse>(`/api/courses/departments/${deptId}/courses`, {
        params: { limit, offset }
      });
      return res.data.courses.map(course => mapApiCourseToUiCourse(course, currency));
    } catch (error) {
      console.error(`Failed to fetch courses for department ${deptId}:`, error);
      return [];
    }
  },

  searchCourses: async (query: string, limit = 50, currency: 'USD' | 'NGN' = 'NGN'): Promise<UICourse[]> => {
    try {
      if (!query || query.length < 2) return [];

      const res = await apiClient.get<SearchCoursesResponse>('/api/courses/search', {
        params: { q: query, limit }
      });
      return res.data.courses.map(course => mapApiCourseToUiCourse(course, currency));
    } catch (error) {
      console.error('Failed to search courses:', error);
      return [];
    }
  },

  getCourseDetails: async (id: string, currency: 'USD' | 'NGN' = 'NGN'): Promise<UICourse | null> => {
    try {
      const res = await apiClient.get<GetCourseDetailsResponse>(`/api/courses/${id}`);
      return mapApiCourseToUiCourse(res.data.course, currency);
    } catch (error) {
      console.error(`Failed to fetch course details for ${id}:`, error);
      return null;
    }
  },
  
  getMyEnrollments: async (currency: 'USD' | 'NGN' = 'NGN'): Promise<UICourse[]> => {
     try {
      const res = await apiClient.get<GetEnrollmentsResponse>('/api/courses/my-enrollments');
      return res.data.enrollments.map(enrollment => mapApiCourseToUiCourse(enrollment, currency));
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      return [];
    }
  },

  purchaseCourse: async (payload: PurchasePayload) => {
     const res = await apiClient.post<PurchaseResponse>(`/api/courses/purchase`, payload);
     return res.data;
  },

  getMixedCourses: async (departments: Department[], limitPerDept = 4, currency: 'USD' | 'NGN' = 'NGN'): Promise<UICourse[]> => {
    try {
      const targetDepts = departments.slice(0, 5);
      
      if (targetDepts.length === 0) return [];

      const promises = targetDepts.map(dept => 
        specialCoursesService.getCoursesByDepartment(dept.id, limitPerDept, 0, currency)
      );

      const results = await Promise.all(promises);
      const allCourses = results.flat();

      // Shuffle for mixed display
      for (let i = allCourses.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCourses[i], allCourses[j]] = [allCourses[j], allCourses[i]];
      }

      return allCourses;
    } catch (error) {
      console.error('Failed to fetch mixed courses:', error);
      return [];
    }
  }
};
