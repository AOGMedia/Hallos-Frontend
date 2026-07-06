'use client';

import { Menu, Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Add logout logic here
    router.push('/signin');
  };

  return (
    <header className="border-b border-border/16 bg-background-dark/50 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-8 lg:py-6">
        {/* Mobile Layout */}
        <div className="flex items-center gap-2 w-full lg:hidden">
          {/* Hamburger Menu */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-[#888c94] hover:text-text-primary transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo/Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <button
              className="relative p-2 text-[#888c94] hover:text-text-primary transition-colors"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f5313b] rounded-full" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-[#888c94] hover:text-red-400 transition-colors"
              aria-label="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between gap-4 w-full">
          {/* Title */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>

          {/* Right Side - Notifications and Logout */}
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <button
              className="relative p-2 text-[#888c94] hover:text-text-primary transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f5313b] rounded-full" />
            </button>

            <div className="w-px h-8 bg-border opacity-20" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-[#888c94] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
