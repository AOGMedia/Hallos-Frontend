'use client';

import { useState } from 'react';
import { AdminHeader } from './AdminHeader';
import AdminSidebarWrapper from './AdminSidebarWrapper';
import AdminToast from './AdminToast';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-zinc-950">
      <AdminSidebarWrapper isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 lg:ml-[247px]">
        <AdminHeader onToggleSidebar={toggleSidebar} />
        <main className="px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
        <AdminToast />
      </div>
    </div>
  );
}
