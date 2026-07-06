'use client';

import React, { useState } from 'react';
import { MetricsOverview } from '@/components/admin/notifications/MetricsOverview';
import { DigestQueueTable } from '@/components/admin/notifications/DigestQueueTable';
import { NotificationLogsTable } from '@/components/admin/notifications/NotificationLogsTable';
import { ManualTriggerPanel } from '@/components/admin/notifications/ManualTriggerPanel';
import { 
  Bell, 
  Settings2, 
  LayoutGrid, 
  History,
  Info
} from 'lucide-react';

export default function AdminNotificationPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3">
            <Bell className="text-primary" size={28} />
            Notification Center
          </h1>
          <p className="text-zinc-500 text-sm mt-1 max-w-xl">
            Monitor digest delivery, notification activity, and email processing across the platform.
          </p>
        </div>
      </div>

      {/* Tabs / Navigation */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900/50 border border-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'overview' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <LayoutGrid size={18} />
          Operational Overview
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'logs' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <History size={18} />
          Logs & History
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-10 animate-in slide-in-from-left-4 duration-500">
          {/* Metrics Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 px-1">
               <Info size={14} className="text-zinc-500" />
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Real-Time Metrics</h2>
             </div>
             <MetricsOverview 
               pendingCount={0} // These would normally come from an aggregate API or derived
               sentCount={0}
               skippedCount={0}
               failedCount={0}
             />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            {/* Digest Queue - Larger column */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-white italic">Digest Queue</h2>
              </div>
              <DigestQueueTable />
            </div>

            {/* Manual Controls - Smaller column */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <Settings2 size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-white italic">Control Panel</h2>
              </div>
              <ManualTriggerPanel />
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-in slide-in-from-right-4 duration-500">
           <NotificationLogsTable />
        </div>
      )}
    </div>
  );
}
