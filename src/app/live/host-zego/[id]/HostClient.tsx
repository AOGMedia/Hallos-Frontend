"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { startZegoLive, joinZegoRoom } from "@/services/zegoService";
import { startSession, joinSession } from "@/services/sessionService";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import dynamic from "next/dynamic";

const LiveStream = dynamic(() => import("@/components/zego-room/LiveStream"), {
  ssr: false,
});

interface HostClientProps {
  liveClassId: string;
}

export default function HostClient({ liveClassId }: HostClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if this is a series session
  const isSeries = searchParams.get('type') === 'series';
  const { user, loading: userLoading } = useCurrentUser();

  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessionData, setSessionData] = useState<any>(null);

  // Redirect unauthenticated users to signin
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/signin?redirect=" + encodeURIComponent(pathname));
    }
  }, [user, userLoading, router, pathname]);

  useEffect(() => {
    let mounted = true;
    
    const initLiveClass = async () => {
      try {
        setStarting(true);

        // 1. Trigger state transition (start the live session)
        // 409 Conflict is expected and handled in zegoService
        await startZegoLive(liveClassId);

        // 2. Join the room as creator to get tokens and room data
        const res = await joinZegoRoom(liveClassId, "creator");

        if (mounted && res.action === "JOIN") {
          if (!Number.isInteger(res.data.appId)) {
            throw new Error("Invalid appId from backend");
          }
          // Sync URL with role for LiveStream template
          const currentParams = new URLSearchParams(window.location.search);
          if (!currentParams.has("role")) {
            router.replace(`${window.location.pathname}?role=Host`, {
              scroll: false,
            });
          }
          setSessionData({
            token: res.data.token,
            roomId: res.data.roomId,
            appId: Number(res.data.appId),
            title: res.data.liveClass?.title,
          });
          setStarting(false);
        } else if (mounted) {
          throw new Error("Failed to join room as creator");
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (mounted) {
          setError(
            e.response?.data?.message ||
              e.message ||
              "Failed to initiate live session"
          );
          setStarting(false);
        }
      }
    };

    const initSeriesSession = async () => {
      try {
        setStarting(true);

        // Try to start the session first
        const response = await startSession(liveClassId);

        if (mounted && response.success) {
          const { data } = response;
          
          // Validate appId
          const appIdNum = Number(data.appId);
          if (!Number.isInteger(appIdNum)) {
            throw new Error("Invalid appId from backend");
          }

          // Sync URL with role for LiveStream template
          const currentParams = new URLSearchParams(window.location.search);
          if (!currentParams.has("role")) {
            const newParams = new URLSearchParams(currentParams);
            newParams.set("role", "Host");
            router.replace(`${window.location.pathname}?${newParams.toString()}`, {
              scroll: false,
            });
          }

          setSessionData({
            token: data.creatorToken,
            roomId: data.roomId,
            appId: appIdNum,
            title: `${data.series.title} - Session ${data.sessionNumber}`,
            sessionNumber: data.sessionNumber,
          });
          setStarting(false);
        } else if (mounted) {
          throw new Error(response.message || "Failed to start session");
        }
      } catch (e: unknown) {
        if (mounted) {
          const error = e as { response?: { data?: { message?: string } }; message?: string };
          const errorMsg = error.response?.data?.message || error.message || "";
          
          // If session is already live, try to join it instead
          if (errorMsg.includes('Current status: live') || errorMsg.includes('already')) {
            console.log('Session already live, attempting to join...');
            try {
              const joinResponse = await joinSession(liveClassId);
              
              if (mounted && joinResponse.success) {
                const { data } = joinResponse;
                
                // Validate appId
                const appIdNum = Number(data.appId);
                if (!Number.isInteger(appIdNum)) {
                  throw new Error("Invalid appId from backend");
                }

                // Sync URL with role for LiveStream template
                const currentParams = new URLSearchParams(window.location.search);
                if (!currentParams.has("role")) {
                  const newParams = new URLSearchParams(currentParams);
                  newParams.set("role", "Host");
                  router.replace(`${window.location.pathname}?${newParams.toString()}`, {
                    scroll: false,
                  });
                }

                setSessionData({
                  token: data.token,
                  roomId: data.roomId,
                  appId: appIdNum,
                  title: `${data.series.title} - Session ${data.sessionNumber}`,
                  sessionNumber: data.sessionNumber,
                });
                setStarting(false);
              } else {
                throw new Error(joinResponse.message || "Failed to join session");
              }
            } catch (joinError: unknown) {
              const jError = joinError as { response?: { data?: { message?: string } }; message?: string };
              setError(
                jError.response?.data?.message ||
                  jError.message ||
                  "Failed to join live session"
              );
              setStarting(false);
            }
          } else {
            setError(errorMsg || "Failed to initiate live session");
            setStarting(false);
          }
        }
      }
    };

    if (liveClassId && !userLoading && user) {
      if (isSeries) {
        initSeriesSession();
      } else {
        initLiveClass();
      }
    }
    
    return () => {
      mounted = false;
    };
  }, [liveClassId, router, user, userLoading, isSeries]);

  if (userLoading || starting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg">{isSeries ? 'Starting Session...' : 'Initiating Live Session...'}</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Launch Failed</h1>
        <p className="text-gray-400 max-w-md mb-8">
          {error ||
            "We couldn't start the live session. Please try again from the dashboard."}
        </p>
        <Button onClick={() => router.push(`/dashboard`)}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
        <Link
          href="/dashboard"
          className="text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeftIcon />
        </Link>
        <div>
          <h1 className="text-white font-bold text-sm leading-tight">
            {sessionData.title || "Live Session"}
          </h1>
          <p className="text-white/60 text-xs italic">
            Host Mode (Uninterrupted)
          </p>
        </div>
      </div>

      <LiveStream
        liveClassId={liveClassId}
        token={sessionData.token}
        roomId={sessionData.roomId}
        appId={sessionData.appId}
      />
    </div>
  );
}
