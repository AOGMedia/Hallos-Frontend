import { Suspense } from "react";
import { CoursesPageClient } from "@/components/dashboard/CoursesPageClient";
import { Loader2 } from "lucide-react";

interface CoursesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const activeDepartment = params.dept as string | undefined;

  return (
    <>
    <div
      className="w-full h-screen"
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
    </div>
    
        </>
  );
}
