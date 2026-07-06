import { DashboardLayoutClient } from "@/components/dashboard/DashboardLayoutClient";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
