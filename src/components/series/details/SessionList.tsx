// ⚠️ TESTING MODE: canStart check is disabled - allows starting any scheduled session
// TODO: Re-enable time window check after testing (15 min before scheduled time)

"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSeriesSessions, joinSession, endSession } from '@/services/sessionService';
import { useRouter } from 'next/navigation';
import type { Session } from '@/types/series';

interface SessionListProps {
  seriesId: string;
  showActions?: boolean;
  isCreator?: boolean;
}

// Memoized SessionCard component to prevent unnecessary re-renders
const SessionCard = ({ 
  session, 
  totalSessions, 
  currentTime,
  showActions,
  isCreator
}: { 
  session: Session; 
  totalSessions: number; 
  currentTime: Date;
  showActions: boolean;
  isCreator: boolean;
}) => {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TEMPORARY: Allow starting any scheduled session for testing
  // TODO: Revert this after testing - should only allow within 15 min window
  const canStart = useMemo(() => {
    return session.status === 'scheduled';
  }, [session.status]);

  const handleStartSession = async () => {
    setIsStarting(true);
    setError(null);
    
    try {
      // Don't start the session here - let HostClient do it
      // Just redirect with the series flag
      router.push(`/live/host-zego/${session.id}?type=series`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      console.error('Error starting session:', err);
    } finally {
      setIsStarting(false);
    }
  };

  // Handle join session (for students)
  const handleJoinSession = async () => {
    setIsJoining(true);
    setError(null);
    
    try {
      const response = await joinSession(session.id);
      
      if (response.success) {
        // Navigate to join page with session credentials
        router.push(`/live/join/${session.id}?type=series`);
      } else {
        setError(response.message || 'Failed to join session');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join session';
      
      // Check for specific error types
      if (errorMessage.includes('402') || errorMessage.includes('payment') || errorMessage.includes('purchase')) {
        setError('Please purchase this series to join sessions');
      } else if (errorMessage.includes('403') || errorMessage.includes('access')) {
        setError('You do not have access to this session');
      } else if (errorMessage.includes('not live') || errorMessage.includes('not started')) {
        setError('This session is not live yet');
      } else {
        setError(errorMessage);
      }
      
      console.error('Error joining session:', err);
    } finally {
      setIsJoining(false);
    }
  };

  // Handle end session (for creator)
  const handleEndSession = async () => {
    setIsEnding(true);
    setError(null);
    
    try {
      const response = await endSession(session.id);
      
      if (response.success) {
        // Session ended successfully - the UI will update via refetch
        // Optionally show a success message
        console.log('Session ended successfully');
      } else {
        setError(response.message || 'Failed to end session');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(errorMessage);
      console.error('Error ending session:', err);
    } finally {
      setIsEnding(false);
    }
  };

  // Calculate countdown only for upcoming sessions
  const countdown = useMemo(() => {
    if (session.status !== 'scheduled') return null;
    
    const start = new Date(session.scheduledStartTime);
    const diff = start.getTime() - currentTime.getTime();

    if (diff <= 0) return 'Starting now';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }, [session.scheduledStartTime, session.status, currentTime]);

  // Memoize formatted date/time
  const { date, time } = useMemo(() => {
    const d = new Date(session.scheduledStartTime);
    
    // Extract time in HH:MM format without timezone conversion
    // This ensures the displayed time matches what the user entered
    const hours = d.getUTCHours().toString().padStart(2, '0');
    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
    
    return {
      date: d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: `${hours}:${minutes}`
    };
  }, [session.scheduledStartTime]);

  const isUpcoming = session.status === 'scheduled' && new Date(session.scheduledStartTime) > currentTime;
  const isLive = session.status === 'live';

  // Status badge config (static, no need to recalculate)
  const statusConfig = {
    scheduled: { text: 'Scheduled', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    live: { text: 'Live', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
    ended: { text: 'Ended', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    cancelled: { text: 'Cancelled', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' }
  }[session.status] || { text: session.status, className: '' };

  return (
    <div
      className={`bg-background-darker/50 p-4 rounded-xl border transition-all hover:border-primary/30 ${
        isLive ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-border/10'
      }`}
    >
      {/* Header with session number and status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-muted text-sm font-medium">
          {session.sessionNumber} of {totalSessions}
        </span>
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${statusConfig.className}`}>
          {statusConfig.text}
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-text-primary text-sm">{date}</span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-text-primary text-sm">{time}</span>
      </div>

      {/* Live indicator */}
      {isLive && (
        <div className="flex items-center gap-2 mb-3 text-red-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          Live Now
        </div>
      )}

      {/* Countdown for upcoming */}
      {isUpcoming && countdown && (
        <div className="mb-3 text-sm text-primary font-medium">
          Starts in: {countdown}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="space-y-2">
          {/* Creator Actions */}
          {isCreator && (
            <>
              {/* Start Session Button */}
              {isUpcoming && canStart && (
                <button
                  className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleStartSession}
                  disabled={isStarting}
                >
                  {isStarting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Starting...
                    </>
                  ) : (
                    'Start Session'
                  )}
                </button>
              )}

              {/* Not yet time message */}
              {isUpcoming && !canStart && (
                <p className="text-xs text-text-muted text-center">
                  Available 15 min before start
                </p>
              )}

              {/* End Session Button */}
              {isLive && (
                <>
                  <button
                    className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    onClick={() => router.push(`/live/host-zego/${session.id}?type=series`)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Rejoin Session
                  </button>
                  <button
                    className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handleEndSession}
                    disabled={isEnding}
                  >
                    {isEnding ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ending...
                      </>
                    ) : (
                      'End Session'
                    )}
                  </button>
                </>
              )}
            </>
          )}

          {/* Student Actions */}
          {!isCreator && (
            <>
              {/* Join Session Button (only when live) */}
              {isLive && (
                <button
                  className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleJoinSession}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Joining...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Now
                    </>
                  )}
                </button>
              )}

              {/* Upcoming session message */}
              {isUpcoming && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                  <p className="text-xs text-blue-400 text-center">
                    Session starts {countdown}
                  </p>
                </div>
              )}

              {/* Ended session message */}
              {session.status === 'ended' && (
                <p className="text-xs text-text-muted text-center">
                  Session ended
                </p>
              )}

              {/* Cancelled session message */}
              {session.status === 'cancelled' && (
                <p className="text-xs text-yellow-400 text-center">
                  Session cancelled
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export function SessionList({ seriesId, showActions = false, isCreator = false }: SessionListProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch sessions - only refetch when tab is visible and only for live/upcoming sessions
  const { data: sessions, isLoading, error, refetch } = useQuery({
    queryKey: ['series-sessions', seriesId],
    queryFn: () => getSeriesSessions(seriesId),
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  // Memoize sorted sessions to prevent re-sorting on every render
  const sortedSessions = useMemo(() => {
    if (!sessions) return [];
    return [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber);
  }, [sessions]);

  const totalSessions = sortedSessions.length;

  // Check if we need countdown updates (only if there are upcoming sessions)
  const hasUpcomingSessions = useMemo(() => 
    sortedSessions.some(s => 
      s.status === 'scheduled' && new Date(s.scheduledStartTime) > currentTime
    ),
    [sortedSessions, currentTime]
  );

  // Only update time if there are upcoming sessions (performance optimization)
  useEffect(() => {
    if (!hasUpcomingSessions) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [hasUpcomingSessions]);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-text-muted text-sm">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">Failed to load sessions</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (totalSessions === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <p>No sessions found for this series</p>
      </div>
    );
  }

  return (
    <div id='sessions' className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {sortedSessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          totalSessions={totalSessions}
          currentTime={currentTime}
          showActions={showActions}
          isCreator={isCreator}
        />
      ))}
    </div>
  );
}
