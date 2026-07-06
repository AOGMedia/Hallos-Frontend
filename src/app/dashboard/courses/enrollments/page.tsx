'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { specialCoursesService } from '@/services/specialCourses.service';
import { SpecialCourseCard } from '@/components/dashboard/SpecialCourseCard';
import type { Course } from '@/data/specialCourses';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference';

export default function MyEnrollmentsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency, setCurrency, isLoaded } = useCurrencyPreference();

  useEffect(() => {
    // Don't fetch until currency preference is loaded
    if (!isLoaded) return;
    
    const fetchEnrollments = async () => {
      try {
        const data = await specialCoursesService.getMyEnrollments(currency);
        setCourses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [currency, isLoaded]);

  return (
    <div className="max-w-[1240px] mx-auto p-4 sm:p-6 lg:p-6">
       <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="hover:opacity-80 transition-opacity">
              <ArrowLeft className="text-[#f2f2f2]" />
           </button>
           <h1 className="text-2xl font-bold text-[#f2f2f2]">My Enrollments</h1>
         </div>
         
         {/* Currency Toggle */}
         <div className="flex items-center bg-[rgba(255,255,255,0.05)] rounded-full p-1">
           <button
             onClick={() => setCurrency('NGN')}
             className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
               currency === 'NGN'
                 ? 'bg-[#6a57e5] text-white'
                 : 'text-gray-300 hover:text-white'
             }`}
           >
             NGN
           </button>
           <button
             onClick={() => setCurrency('USD')}
             className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
               currency === 'USD'
                 ? 'bg-[#6a57e5] text-white'
                 : 'text-gray-300 hover:text-white'
             }`}
           >
             USD
           </button>
         </div>
       </div>

       {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#6a57e5] w-8 h-8" /></div>
       ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {courses.map(course => (
                <SpecialCourseCard key={course.id} {...course} />
             ))}
          </div>
       ) : (
          <div className="text-center text-gray-400 py-20">
             You haven&apos;t enrolled in any courses yet.
          </div>
       )}
    </div>
  )
}
