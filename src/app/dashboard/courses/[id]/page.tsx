'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Users, Clock, Star, Loader2 } from 'lucide-react';
import { specialCoursesService } from '@/services/specialCourses.service';
import type { Course } from '@/data/specialCourses';
import { usePaymentStore } from '@/store/paymentStore';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference';
import { CourseEnrollmentModal } from '@/components/dashboard/CourseEnrollmentModal';
import { GeneratedCourseThumbnail } from '@/components/course/GeneratedCourseThumbnail';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum'>('overview');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { currency, isLoaded } = useCurrencyPreference();
  
  // Use openEnrollmentModal instead of openModal
  const { openEnrollmentModal, setContent, setPriceCurrency } = usePaymentStore();

  useEffect(() => {
    // Don't fetch until currency preference is loaded
    if (!isLoaded) return;
    
    const fetchCourse = async () => {
      if (params.id) {
         try {
           const data = await specialCoursesService.getCourseDetails(params.id as string, currency);
           setCourse(data);
         } catch (e) {
             console.error(e);
         } finally {
            setLoading(false);
         }
      }
    };
    fetchCourse();
  }, [params.id, currency, isLoaded]);

  const handleBuy = () => {
      if (course) {
          setContent('special_course', course.id);
          
          // Helper to extract price and currency
          let priceClean = '0';
          let detectedCurrency = 'NGN';

          if (course.price) {
             priceClean = course.price.replace(/[^0-9.]/g, '');
             if (course.price.includes('$')) detectedCurrency = 'USD';
             // If price text has NGN or unicode, it defaults to NGN.
             // If API returns localized string '₦50,000', defaults NGN.
          }
          
          setPriceCurrency(priceClean, detectedCurrency);
          openEnrollmentModal(); // Changed to openEnrollmentModal
      }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#6a57e5] animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl text-[#f2f2f2] mb-4">Course not found</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-[#6a57e5] hover:underline"
        >
          Go back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1024px] mx-auto">
      {/* Back Button and Breadcrumb */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              // Check if we have department context in URL
              const urlParams = new URLSearchParams(window.location.search);
              const dept = urlParams.get('dept');
              const hash = window.location.hash;
              
              if (dept && hash) {
                // Navigate back to courses page with department context and scroll position
                router.push(`/course?dept=${dept}${hash}`, { scroll: false });
              } else if (dept) {
                // Navigate back to courses page with department context
                router.push(`/course?dept=${dept}`, { scroll: false });
              } else {
                // Fallback to dashboard
                router.push('/dashboard');
              }
            }}
            className="flex-shrink-0"
          >
            <ArrowLeft size={19} className="text-[#f2f2f2]" />
          </button>
          <h1 className="text-[#f2f2f2] text-2xl sm:text-[32px] font-medium">
            Explore Self-Paced Courses &gt; {course.title}
          </h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Course Card */}
          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-6 p-4 sm:p-6 rounded-2xl shadow-[0px_1px_2px_rgba(16,24,40,0.05)] mb-6"
            style={{
              background:
                'linear-gradient(0deg, rgba(31, 38, 54, 0.3), rgba(31, 38, 54, 0.3)), linear-gradient(0deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.18))',
            }}
          >
            {/* Thumbnail - Real image or Generated */}
            <div className="relative w-full sm:w-[200px] h-[200px] sm:h-[163px] flex-shrink-0 rounded overflow-hidden">
              {course.imageUrl && course.imageUrl.trim() !== '' ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 200px"
                />
              ) : (
                <GeneratedCourseThumbnail
                  courseId={course.id}
                  courseTitle={course.title}
                  className="w-full h-full"
                  showFirstLetter={true}
                />
              )}
            </div>

            {/* Course Info */}
            <div className="flex flex-col gap-2.5 flex-1">
              <div className="flex items-center justify-between gap-2.5">
                <h2 className="text-[#f2f2f2] text-base font-bold leading-4 tracking-[0.08px]">
                  {course.title}
                </h2>
                {course.price && (
                  <span className="text-[#1f2636] text-xs font-bold leading-3 bg-white rounded px-2 py-1 flex-shrink-0">
                    {course.price}
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-2.5 bg-[rgba(244,244,244,0.08)] rounded px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#dbdbdb]" />
                  <span className="text-[#dbdbdb] text-sm font-normal leading-[14px] tracking-[0.07px]">
                    {course.enrolled}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#dbdbdb]" />
                  <span className="text-[#dbdbdb] text-xs font-normal leading-3">
                    {course.duration}
                  </span>
                </div>
                <div className="ml-auto">
                  <Image
                    src="/icons/bookmark.svg"
                    alt="bookmark"
                    width={13}
                    height={15}
                    className="w-[13px] h-[15px] cursor-pointer"
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(87%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(86%)',
                    }}
                  />
                </div>
              </div>

              {/* Type and Rating */}
              <div className="flex items-center gap-2.5">
                <span className="text-[#dbdbdb] text-sm font-medium leading-[14px] tracking-[0.07px]">
                  {course.type}
                </span>
                <div className="flex items-center gap-1.5">
                  <Star size={14} fill="#ffd42a" className="text-[#ffd42a]" />
                  <span className="text-[#dbdbdb] text-xs font-normal leading-3">
                    {course.rating}  ({course.ratingCount})
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-[#dbdbdb] text-sm font-normal leading-[21px] tracking-[0.07px]">
                {course.description && course.description.length > 150 ? (
                  <>
                    <p>
                      {showFullDescription 
                        ? course.description 
                        : `${course.description.substring(0, 150)}...`
                      }
                    </p>
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-[#6a57e5] hover:underline text-sm mt-1"
                    >
                      {showFullDescription ? 'Read less' : 'Read more'}
                    </button>
                  </>
                ) : (
                  <p>{course.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="inline-flex items-center gap-6 px-3 py-2.5 rounded-[100px] mb-6"
            style={{ backgroundColor: 'rgba(106, 87, 229, 0.10)' }}
          >
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-sm leading-[14px] transition-all ${
                activeTab === 'overview'
                  ? 'text-[#f2f2f2] font-medium'
                  : 'text-[#888c94] font-normal'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`text-sm leading-[14px] transition-all ${
                activeTab === 'curriculum'
                  ? 'text-[#f2f2f2] font-medium'
                  : 'text-[#888c94] font-normal'
              }`}
            >
              Curriculum
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex flex-col gap-4">
            {activeTab === 'overview' ? (
              <>
                {/* Overview Content */}
                {course.fullDescription && (
                  <p className="text-[#f2f2f2] text-sm font-bold leading-[21px] whitespace-pre-line">
                    {course.fullDescription}
                  </p>
                )}

                {/* Benefits */}
                {course.benefits && course.benefits.length > 0 && (
                  <div 
                    className="p-5 rounded-[10px]"
                    style={{
                      background: 'linear-gradient(0deg, #1F2636, #1F2636), linear-gradient(249.02deg, rgba(106, 87, 229, 0) 4.59%, #1F2636 95.53%), linear-gradient(250.32deg, rgba(106, 87, 229, 0.2) 5.32%, rgba(229, 87, 198, 0.2) 95.16%)'
                    }}
                  >
                    <ul className="text-[rgba(242,242,242,0.8)] text-sm font-normal leading-[21px] space-y-1">
                      {course.benefits.map((benefit, index) => (
                        <li key={index}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Who Should Take */}
                {course.whoShouldTake && (
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[#f2f2f2] text-base font-bold">
                      {course.whoShouldTake.title}
                    </h3>
                    <p className="text-[rgba(242,242,242,0.8)] text-sm font-normal leading-[21px] whitespace-pre-line">
                      {course.whoShouldTake.content}
                    </p>
                  </div>
                )}

                {/* Certification */}
                {course.certification && (
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[#f2f2f2] text-base font-bold">
                      {course.certification.title}
                    </h3>
                    <p className="text-[rgba(242,242,242,0.8)] text-sm font-normal leading-[21px]">
                      {course.certification.content}
                    </p>
                  </div>
                )}

                {/* Learning Outcomes */}
                {course.learningOutcomes && (
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[#f2f2f2] text-base font-bold">
                      {course.learningOutcomes.title}
                    </h3>
                    <p className="text-[rgba(242,242,242,0.8)] text-sm font-normal leading-[21px] whitespace-pre-line">
                      {course.learningOutcomes.content}
                    </p>
                  </div>
                )}

                {/* Assessment */}
                {course.assessment && (
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[#f2f2f2] text-base font-bold">
                      {course.assessment.title}
                    </h3>
                    <p className="text-[rgba(242,242,242,0.8)] text-sm font-normal leading-[21px]">
                      {course.assessment.content}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Curriculum Content */}
                {course.modules && course.modules.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {course.modules.map((module) => (
                      <div
                        key={module.id}
                        className="p-5 rounded-[10px]"
                        style={{
                          background:
                            'linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%), #1f2636',
                        }}
                      >
                        <h3 className="text-[#f2f2f2] text-base font-bold mb-2.5">
                          {module.title}
                        </h3>
                        <p className="text-[rgba(242,242,242,0.8)] text-sm font-normal leading-[21px]">
                          • {module.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#888c94] text-sm">
                    Curriculum information coming soon.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-[201px] flex-shrink-0">
          <div className="flex flex-col gap-4 sticky top-6">
            {/* Course Meta */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[#dbdbdb] text-sm font-medium leading-[14px] tracking-[0.07px]">
                  {course.type}
                </span>
                <div className="flex items-center gap-1.5">
                  <Star size={14} fill="#ffd42a" className="text-[#ffd42a]" />
                  <span className="text-[#dbdbdb] text-xs font-normal leading-3">
                    {course.rating}  ({course.ratingCount})
                  </span>
                </div>
              </div>

              <div
                className="flex items-center gap-2.5 bg-[rgba(244,244,244,0.08)] rounded px-3 py-1.5"
              >
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#dbdbdb]" />
                  <span className="text-[#dbdbdb] text-sm font-normal leading-[14px] tracking-[0.07px]">
                    {course.enrolled}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-[#dbdbdb]" />
                  <span className="text-[#dbdbdb] text-xs font-normal leading-3">
                    {course.duration}
                  </span>
                </div>
                <div className="ml-auto">
                  <Image
                    src="/icons/bookmark.svg"
                    alt="bookmark"
                    width={13}
                    height={15}
                    className="w-[13px] h-[15px] cursor-pointer"
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(87%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(86%)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Buy Button */}
            <button
              onClick={handleBuy}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-[1000px] bg-[#6a57e5] text-white text-base font-bold transition-all hover:bg-[#5546c9]"
            >
              <span>Enroll Now</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      {/* Replaced PaymentModal with CourseEnrollmentModal */}
      <CourseEnrollmentModal />
    </div>
  );
}
