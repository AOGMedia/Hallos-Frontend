import { Suspense } from "react";
import { CoursesPageClient } from "@/components/dashboard/CoursesPageClient";
import { DepartmentLinks } from "@/components/course/public/DepartmentLinks";
import { Loader2 } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { fetchDepartments } from "@/lib/seo/publicApi";

// ?dept= only filters the same catalog, so every variant canonicalises to /course.
export const metadata = buildMetadata({
  title: "Self-paced online courses with certificates",
  description:
    "Browse self-paced online courses on Hallos across tech, data analysis, design, marketing, business and more. Learn at your own pace and earn a certificate.",
  path: "/course",
});

interface CoursesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const activeDepartment = params.dept as string | undefined;
  const departments = await fetchDepartments();

  return (
    <>
    <div
      // min-h (not h-screen) so the server-rendered department links below never overlap a tall catalog
      className="w-full min-h-screen"
      style={{
        background:
        "linear-gradient(249.02deg, rgba(106, 87, 229, 0) 4.59%, #1F2636 95.53%)"

        // "linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%), #1f2636",
      }}
      >
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-[200px]">
            <Loader2 className="w-8 h-8 text-[#6a57e5] animate-spin" />
          </div>
        }
        >
        <CoursesPageClient initialDepartment={activeDepartment} />
      </Suspense>

      {/* Crawlable entry points into the catalog (the grid above renders client-side) */}
      <div className="px-4 sm:px-6 lg:px-6 pb-16">
        <DepartmentLinks departments={departments} />
      </div>
    </div>

        </>
  );
}
