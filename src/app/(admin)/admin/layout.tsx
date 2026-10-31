import type { Metadata } from 'next';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import AdminGuard from '@/components/admin/AdminGuard';
import { NO_INDEX, sectionTitle } from '@/lib/metadata';

export const metadata: Metadata = {
  title: sectionTitle('Admin'),
  robots: NO_INDEX,
};

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
