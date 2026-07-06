'use client';

import React from 'react';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Bell size={24} />
          </div>
          <h1 className="text-3xl font-bold text-text-primary italic tracking-tight">Notifications</h1>
        </div>
        <p className="text-text-muted max-w-md text-sm">
          Manage how you receive alerts, summaries, and personalized updates from the platform.
        </p>
      </div>

      {/* Preferences Content */}
      <NotificationPreferences />
    </div>
  );
}