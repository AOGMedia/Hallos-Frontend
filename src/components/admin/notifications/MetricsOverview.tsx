'use client';

import React from 'react';
import { Clock, CheckCircle2, AlertCircle, MailQuestion } from 'lucide-react';

interface MetricsOverviewProps {
  pendingCount: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
}

export function MetricsOverview({ 
  pendingCount, 
  sentCount, 
  skippedCount, 
  failedCount 
}: MetricsOverviewProps) {
  const stats = [
    { 
      label: 'Pending Digests', 
      value: pendingCount, 
      icon: Clock, 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    { 
      label: 'Sent (24h)', 
      value: sentCount, 
      icon: CheckCircle2, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    { 
      label: 'Skipped', 
      value: skippedCount, 
      icon: MailQuestion, 
      color: 'text-zinc-400', 
      bg: 'bg-zinc-400/10',
      border: 'border-zinc-400/20'
    },
    { 
      label: 'Failed', 
      value: failedCount, 
      icon: AlertCircle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div 
          key={stat.label}
          className={`p-5 rounded-2xl bg-zinc-900/50 border ${stat.border} flex flex-col gap-3`}
        >
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
