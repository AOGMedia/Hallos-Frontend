"use client";
import { memo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SpecialCourseCard } from "./SpecialCourseCard";
import { specialCoursesService } from "@/services/specialCourses.service";
import type { Course } from "@/data/specialCourses";
import { Search, Loader2, ArrowRightIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrencyPreference } from "@/hooks/useCurrencyPreference";
import { Button } from "../ui/Button";
import { useScrollArrows } from "@/hooks/useScrollArrows";

interface Department {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SpecialCoursesSectionProps {
  isLandingPage?: boolean;
}

export const SpecialCoursesSection = memo(function SpecialCoursesSection({
  isLandingPage = false,
}: SpecialCoursesSectionProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeDepartment, setActiveDepartment] = useState<string | "all">(
    "all",
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptLoading, setDeptLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { currency, isLoaded } = useCurrencyPreference();
  
  // Scroll arrows for department tabs
  const { 
    scrollContainerRef: deptScrollRef, 
    showLeftArrow: showDeptLeftArrow, 
    showRightArrow: showDeptRightArrow, 
    scroll: deptScroll, 
    checkScroll: checkDeptScroll 
  } = useScrollArrows({
    scrollAmount: 200,
    threshold: 1
  });

  // Scroll arrows for courses
  const { 
    scrollContainerRef: coursesScrollRef, 
    showLeftArrow: showCoursesLeftArrow, 
    showRightArrow: showCoursesRightArrow, 
    scroll: coursesScroll, 
    checkScroll: checkCoursesScroll 
  } = useScrollArrows({
    scrollAmount: 300,
    threshold: 1
  });

  // Fetch Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      setDeptLoading(true);
      const depts = await specialCoursesService.getDepartments();
      setDepartments(depts);
      // console.log('Fetched Departments:', depts); // Debug log

      // Try to find "IT & Software", handling potential whitespace/case mismatches
      // Also fallback to "Technology" if IT & Software isn't found, just in case.
      const targetName = "it & software";
      const defaultDept = depts.find(
        (d) =>
          d.name.toLowerCase().trim() === targetName ||
          d.name.toLowerCase().includes(targetName),
      );

      if (defaultDept) {
        setActiveDepartment(defaultDept.id);
      } else {
        console.log(
          'Default department not found, checking for "Technology"...',
        );
        const techDept = depts.find((d) =>
          d.name.toLowerCase().includes("technology"),
        );
        if (techDept) {
          setActiveDepartment(techDept.id);
        } else {
          setActiveDepartment("all");
        }
      }

      setDeptLoading(false);
    };
    fetchDepartments();
  }, []);

  // Check scroll arrows after departments are loaded
  useEffect(() => {
    if (!deptLoading && departments.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        checkDeptScroll();
      }, 100);
    }
  }, [deptLoading, departments, checkDeptScroll]);

  // Check scroll arrows after courses are loaded
  useEffect(() => {
    if (!loading && courses.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        checkCoursesScroll();
      }, 150);
      // Also check after a longer delay to catch any layout shifts
      setTimeout(() => {
        checkCoursesScroll();
      }, 500);
    }
  }, [loading, courses, checkCoursesScroll]);

  // Fetch Courses based on activeDepartment or Search
  useEffect(() => {
    // Don't fetch until currency preference is loaded
    if (!isLoaded) return;

    // If departments are still loading and we are in 'all' mode (default),
    // wait for them before fetching courses (unless searching).
    if (activeDepartment === "all" && deptLoading && !searchQuery) {
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      try {
        let results: Course[] = [];
        // Only search if query is long enough
        if (searchQuery.trim().length >= 2) {
          results = await specialCoursesService.searchCourses(
            searchQuery,
            50,
            currency,
          );
        } else if (activeDepartment === "all") {
          // Fetch mixed courses from multiple departments
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

  // No need to split courses into rows - using single column layout

  return (
    <section className="mb-8 sm:mb-12 lg:mb-20">
      {/* Container with gradient background */}
      <div
        className="rounded-xl lg:rounded-[12px] p-4 sm:p-6 lg:p-6"
        style={{
          background:
            "linear-gradient(249.02deg, rgba(106, 87, 229, 0) 4.59%, #1F2636 95.53%)",
        }}
      >
        {/* Header */}
        {isLandingPage && (
          <div className="flex items-center flex-col w-full mb-10 gap-2">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold leading-tight">
              Learn at Your Own Pace
            </h2>
            <p className="text-[16px] text-[#F2F2F2]">
              Certified self-guided courses designed to fit your schedule and
              goals.
            </p>
          </div>
        )}
        {!isLandingPage && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
        )}

        {/* Departments Tabs */}
        {!isLandingPage && (
          <>
            {(departments.length > 0 || deptLoading) && (
              <div className="relative w-full">
                {/* Left Arrow */}
                {showDeptLeftArrow && (
                  <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deptScroll('left');
                      }}
                      className="w-12 h-full flex items-center justify-center bg-gradient-to-r from-[#1F2636] via-[#1F2636]/90 to-transparent hover:from-[#2a3142] transition-colors pointer-events-auto"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                  </div>
                )}

                <div ref={deptScrollRef} className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                  {/* 'All' button - resets to default view (First Dept) */}
                  <button
                    onClick={() => {
                      setActiveDepartment("all");
                      setSearchQuery("");
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeDepartment === "all" && !searchQuery
                        ? "bg-[#6a57e5] text-white"
                        : "bg-[rgba(255,255,255,0.05)] text-gray-300 hover:bg-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    All
                  </button>
                  {deptLoading
                    ? // Skeleton loader for tabs
                      [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="w-24 h-9 bg-[rgba(255,255,255,0.05)] rounded-full animate-pulse"
                        />
                      ))
                    : departments.map((dept) => (
                        <button
                          key={dept.id}
                          onClick={() => {
                            setActiveDepartment(dept.id);
                            setSearchQuery("");
                          }}
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
                {showDeptRightArrow && (
                  <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deptScroll('right');
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
          </>
        )}

        {/* Courses - Single Column Horizontal Scrolling */}
        {loading || deptLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="w-8 h-8 text-[#6a57e5] animate-spin" />
          </div>
        ) : courses.length > 0 ? (
          <div className="relative w-full -mx-4 sm:mx-0">
            {/* Left Arrow */}
            {showCoursesLeftArrow && (
              <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    coursesScroll('left');
                  }}
                  className="w-8 h-full flex items-center justify-center bg-gradient-to-r from-[#1F2636]/60 to-transparent hover:from-[#1F2636]/80 transition-colors pointer-events-auto"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            <div ref={coursesScrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-4 sm:px-0">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="w-[300px] sm:w-[350px] flex-shrink-0"
                >
                  <SpecialCourseCard {...course} />
                </div>
              ))}
              {/* Spacer for right padding */}
              <div className="w-1 flex-shrink-0" />
            </div>

            {/* Right Arrow */}
            {showCoursesRightArrow && (
              <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    coursesScroll('right');
                  }}
                  className="w-8 h-full flex items-center justify-center bg-gradient-to-l from-[#1F2636]/60 to-transparent hover:from-[#1F2636]/80 transition-colors pointer-events-auto"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 2
              ? "Please enter at least 2 characters to search."
              : "No courses found."}
          </div>
        )}

        {isLandingPage && (
          <Button
            variant="primary"
            size="lg"
            className="flex items-center gap-2 w-full sm:w-auto mx-auto justify-center"
          >
            <Link href="/signup" className="flex items-center text-center">
              See how it works
              <ArrowRightIcon width={18} height={14} color="#FFFFFF" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
});
