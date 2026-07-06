'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { LayoutDashboard, Users, Gamepad2, Bell } from 'lucide-react';

const adminMenuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Enrollments', icon: Users, href: '/admin/enrollments' },
  { name: 'Quiz', icon: Gamepad2, href: '/admin/quiz' },
  { name: 'Notifications', icon: Bell, href: '/admin/notifications' },
];

interface AdminSidebarWrapperProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebarWrapper({ isOpen, onClose }: AdminSidebarWrapperProps) {
  return (
    <Sidebar
      mainMenuItems={adminMenuItems}
      userMenuItems={[]}
      settingsMenuItems={[]}
      showCreateDropdown={false}
      isOpen={isOpen}
      onClose={onClose}
      logo={{
        src: "/transparentlogo.svg",
        alt: "Admin Panel",
        width: 118,
        height: 36,
      }}
    />
  );
}
