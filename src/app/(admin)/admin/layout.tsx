import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import AdminGuard from '@/components/admin/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminGuard>
  );
}
