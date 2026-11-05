import type { Metadata } from "next";
import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NO_INDEX, sectionTitle } from "@/lib/metadata";

// Signed-in area: keep it out of search. Shared links (videos, communities)
// still get rich previews from their own generateMetadata.
export const metadata: Metadata = {
  title: sectionTitle("Dashboard"),
  robots: NO_INDEX,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayoutClient>
        {children}
      </DashboardLayoutClient>
    </ProtectedRoute>
  );
}
