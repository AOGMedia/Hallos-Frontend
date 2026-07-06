"use client";

import { useMemo } from 'react';
import type { Series } from '@/types/series';

interface SeriesStatsProps {
  series: Series;
}

export function SeriesStats({ series }: SeriesStatsProps) {
  const stats = series.stats;

  // Calculate next session countdown
  const nextSessionCountdown = useMemo(() => {
    if (!stats?.nextSession) return null;

    const now = new Date();
    const start = new Date(stats.nextSession.scheduledStartTime);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return 'Starting soon';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [stats?.nextSession]);

  // Format next session date — display as stored (no timezone shift)
  const nextSessionDate = useMemo(() => {
    if (!stats?.nextSession) return null;
    
    const raw = stats.nextSession.scheduledStartTime;
    // Parse the date part and time part directly to avoid timezone conversion
    const date = new Date(raw);
    const datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    // Use UTC hours/minutes to avoid local timezone offset
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, '0');
    return `${datePart}, ${h}:${m} ${ampm}`;
  }, [stats?.nextSession]);

  if (!stats) {
    return (
      <div className="bg-background-card p-6 rounded-lg">
        <p className="text-text-muted text-center">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="bg-background-card p-6 rounded-lg space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Series Statistics</h2>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-text-muted">Completion</span>
          <span className="text-sm font-semibold text-text-primary">
            {stats.completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-background-darker rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-1">
          {stats.completedSessions} of {stats.totalSessions} sessions completed
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Sessions */}
        <div className="bg-background-darker p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs text-text-muted">Total</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.totalSessions}</p>
        </div>

        {/* Completed Sessions */}
        <div className="bg-background-darker p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-text-muted">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.completedSessions}</p>
        </div>

        {/* Scheduled Sessions */}
        <div className="bg-background-darker p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-text-muted">Scheduled</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{stats.scheduledSessions}</p>
        </div>

        {/* Live Sessions */}
        <div className="bg-background-darker p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-text-muted">Live</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.liveSessions}</p>
        </div>
      </div>

      {/* Cancelled Sessions (if any) */}
      {stats.cancelledSessions > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm text-yellow-400">
              {stats.cancelledSessions} session{stats.cancelledSessions > 1 ? 's' : ''} cancelled
            </span>
          </div>
        </div>
      )}

      {/* Next Session Info */}
      {stats.nextSession && (
        <div className="border-t border-border/20 pt-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Next Session</h3>
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-text-muted mb-1">Session {stats.nextSession.sessionNumber}</p>
                <p className="text-sm text-text-primary">{nextSessionDate}</p>
              </div>
              {nextSessionCountdown && (
                <div className="text-right">
                  <p className="text-xs text-text-muted mb-1">Starts in</p>
                  <p className="text-lg font-bold text-primary">{nextSessionCountdown}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Session Info */}
      {stats.activeSession && (
        <div className="border-t border-border/20 pt-4">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm font-semibold text-red-400">LIVE NOW</span>
              </div>
              <span className="text-sm text-text-primary">
                Session {stats.activeSession.sessionNumber}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* No Upcoming Sessions */}
      {!stats.nextSession && !stats.activeSession && stats.scheduledSessions === 0 && (
        <div className="border-t border-border/20 pt-4">
          <p className="text-sm text-text-muted text-center">
            {stats.completedSessions === stats.totalSessions 
              ? 'All sessions completed' 
              : 'No upcoming sessions scheduled'}
          </p>
        </div>
      )}
    </div>
  );
}
