"use client";
import { memo, useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SpecialCourseCard } from "./SpecialCourseCard";
import { specialCoursesService } from "@/services/specialCourses.service";
import type { Course } from "@/data/specialCourses";
import { Search, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useCurrencyPreference } from "@/hooks/useCurrencyPreference";
import { useScrollArrows } from "@/hooks/useScrollArrows";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CoursesPageClientProps {
  initialDepartment?: string;
}

export const CoursesPageClient = memo(function CoursesPageClient({
  initialDepartment,
}: CoursesPageClientProps) {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeDepartment, setActiveDepartment] = useState<string | "all">("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptLoading, setDeptLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useCurrentUser();
  const { currency, isLoaded } = useCurrencyPreference();
  const scrollRestorationAttempted = useRef(false);
  const { scrollContainerRef, showLeftArrow, showRightArrow, scroll, checkScroll } = useScrollArrows({
    scrollAmount: 200,
    threshold: 1
  });

  // Disable browser scroll restoration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setDeptLoading(true);
      const depts = await specialCoursesService.getDepartments();
      setDepartments(depts);

      // Set initial department from URL or default
      if (initialDepartment) {
        const normalizedInitial = initialDepartment.toLowerCase();
        const dept = depts.find(d => {
          const normalizedName = d.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '').replace(/[^a-z0-9-]/g, '');
          return d.slug === initialDepartment || normalizedName === normalizedInitial;
        });
        if (dept) {
          setActiveDepartment(dept.id);
        } else {
          setActiveDepartment("all");
        }
      } else {
        // Default to IT & Software or first available
        const targetName = "it & software";
        const defaultDept = depts.find(
          (d) =>
            d.name.toLowerCase().trim() === targetName ||
            d.name.toLowerCase().includes(targetName),
        );

        if (defaultDept) {
          setActiveDepartment(defaultDept.id);
        } else {
          const techDept = depts.find((d) =>
            d.name.toLowerCase().includes("technology"),
          );
          if (techDept) {
            setActiveDepartment(techDept.id);
          } else {
            setActiveDepartment("all");
          }
        }
      }

      setDeptLoading(false);
    };
    fetchDepartments();
  }, [initialDepartment]);

  // Check scroll arrows after departments are loaded
  useEffect(() => {
    if (!deptLoading && departments.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        checkScroll();
      }, 100);
    }
  }, [deptLoading, departments, checkScroll]);

  // Fetch Courses based on activeDepartment or Search
  useEffect(() => {
    if (!isLoaded) return;

    if (activeDepartment === "all" && deptLoading && !searchQuery) {
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      try {
        let results: Course[] = [];
        if (searchQuery.trim().length >= 2) {
          results = await specialCoursesService.searchCourses(
            searchQuery,
            50,
            currency,
          );
        } else if (activeDepartment === "all") {
          if (departments.length > 0) {
            results = await specialCoursesService.getMixedCourses(
              departments,
              4,
              currency,
            );
          } else {
            results = [];
          }
        } else {
          results = await specialCoursesService.getCoursesByDepartment(
            activeDepartment,
            50,
            0,
            currency,
          );
        }
        setCourses(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCourses();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    activeDepartment,
    searchQuery,
    departments,
    deptLoading,
    currency,
    isLoaded,
  ]);

  // Scroll restoration logic
  useEffect(() => {
    if (loading || deptLoading || scrollRestorationAttempted.current) return;

    const hash = window.location.hash;
    
    if (hash && hash.startsWith('#course-')) {
      const courseId = hash.replace('#course-', '');
      
      // Wait a bit more for the DOM to be ready
      const attemptScroll = () => {
        const targetElement = document.getElementById(`course-${courseId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          scrollRestorationAttempted.current = true;
        } else {
          // If element not found, try again after a short delay
          setTimeout(attemptScroll, 200);
        }
      };
      
      setTimeout(attemptScroll, 300);
    }
  }, [loading, deptLoading, courses]);

  // Helper to split courses into two rows for independent horizontal scrolling
  const courseRows = useMemo(() => {
    const rows: Course[][] = [[], []];
    courses.forEach((course, index) => {
      rows[index % 2].push(course);
    });
    return rows;
  }, [courses]);

  // Handle department change with URL update
  const handleDepartmentChange = (deptId: string | "all") => {
    const dept = departments.find(d => d.id === deptId);
    const deptSlug = dept ? dept.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '').replace(/[^a-z0-9-]/g, '') : 'all';
    
    // Update URL without scrolling
    const newUrl = deptId === "all" ? '/course' : `/course?dept=${deptSlug}`;
    router.push(newUrl, { scroll: false });
    
    setActiveDepartment(deptId);
    setSearchQuery("");
    scrollRestorationAttempted.current = false;
  };

  // Handle course card click with context preservation
  const handleCourseClick = (courseId: string) => {
    const currentDept = departments.find(d => d.id === activeDepartment);
    const deptSlug = currentDept ? currentDept.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '').replace(/[^a-z0-9-]/g, '') : 'all';
    
    const courseUrl = activeDepartment === "all" 
      ? `/dashboard/courses/${courseId}#course-${courseId}`
      : `/dashboard/courses/${courseId}?dept=${deptSlug}#course-${courseId}`;
    
    router.push(courseUrl);
  };

  return (
    <section className={`mb-8 sm:mb-12 lg:mb-20 ${!user ? 'pt-20' : ''}`}>
      {/* Container with gradient background */}
      <div
        className="rounded-xl lg:rounded-[12px] p-4 sm:p-6 lg:p-6"
        style={{
          background:
          "linear-gradient(249.02deg, rgba(106, 87, 229, 0) 4.59%, #1F2636 95.53%)"

            // "linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%), #1f2636",
        }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 rounded-full bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-all mr-2"
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <Image
                src="/navIcon.png"
                alt="Special Courses"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <h2 className="text-[#f2f2f2] text-lg sm:text-xl font-bold leading-5">
                Self-Paced Courses
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Currency Toggle - Commented out for now */}
            {/* <div className="flex items-center bg-[rgba(255,255,255,0.05)] rounded-full p-1">
              <button
                onClick={() => setCurrency("NGN")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currency === "NGN"
                    ? "bg-[#6a57e5] text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                NGN
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currency === "USD"
                    ? "bg-[#6a57e5] text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                USD
              </button>
            </div> */}

            {/* Link to enrollments page */}
            <Link
              href="/dashboard/courses/enrollments"
              className="text-[#6a57e5] text-sm font-medium hover:underline"
            >
              My Enrollments
            </Link>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#6a57e5] w-[200px] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Departments Tabs */}
        {(departments.length > 0 || deptLoading) && (
          <div className="relative w-full">
            {/* Left Arrow */}
            {showLeftArrow && (
              <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    scroll('left');
                  }}
                  className="w-12 h-full flex items-center justify-center bg-gradient-to-r from-[#1F2636] via-[#1F2636]/90 to-transparent hover:from-[#2a3142] transition-colors pointer-events-auto"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
              {/* 'All' button */}
              <button
                onClick={() => handleDepartmentChange("all")}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeDepartment === "all" && !searchQuery
                    ? "bg-[#6a57e5] text-white"
                    : "bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)]"
                }`}
              >
                All
              </button>
              {deptLoading
                ? [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-24 h-9 bg-[rgba(255,255,255,0.05)] rounded-full animate-pulse"
                    />
                  ))
                : departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => handleDepartmentChange(dept.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeDepartment === dept.id && !searchQuery
                          ? "bg-[#6a57e5] text-white"
                          : "bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      {dept.name}
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
                  className="w-12 h-full flex items-center justify-center bg-gradient-to-l from-[#1F2636] via-[#1F2636]/90 to-transparent hover:from-[#2a3142] transition-colors pointer-events-auto"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Courses - Two Independent Horizontal Scrolling Rows */}
        {loading || deptLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="w-8 h-8 text-[#6a57e5] animate-spin" />
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-4">
            {courseRows.map((row, rowIndex) => (
              row.length > 0 && (
                <div
                  key={rowIndex}
                  className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                >
                  {row.map((course) => (
                    <div
                      key={course.id}
                      id={`course-${course.id}`}
                      className="w-[300px] sm:w-[350px] flex-shrink-0"
                    >
                      <SpecialCourseCard 
                        {...course} 
                        onClick={() => handleCourseClick(course.id)}
                      />
                    </div>
                  ))}
                  {/* Spacer for right padding */}
                  <div className="w-1 flex-shrink-0" />
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 2
              ? "Please enter at least 2 characters to search."
              : "No courses found."}
          </div>
        )}
      </div>
    </section>
  );
});