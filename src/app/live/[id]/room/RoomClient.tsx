"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  joinZegoRoom,
  startZegoLive,
  JoinRoomResponse,
} from "@/services/zegoService";
import { getLiveClass } from "@/services/liveClassService";
import { getSessionDetails, joinSession, startSession } from "@/services/sessionService";
import type { StartSessionResponse, JoinSessionResponse } from "@/types/series";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
import Link from "next/link";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";

const LiveStream = dynamic(() => import("@/components/zego-room/LiveStream"), {
  ssr: false,
});

interface RoomClientProps {
  liveClassId: string;
}

export default function RoomClient({ liveClassId }: RoomClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useCurrentUser();
  const isSeries = searchParams.get('type') === 'series';
  const fromCommunityId = searchParams.get('communityId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<{ action: string; data: JoinRoomResponse } | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isSeries) {
          // ✅ SERIES SESSION FLOW
          const sessionId = liveClassId;
          
          // Get session details to check ownership
          const session = await getSessionDetails(sessionId);
          const isOwner = user && session.series && String(session.series.userId) === String(user.id);

          // ✅ FIXED: Properly type the credentials based on whether user is owner
          let token: string;
          let role: string;
          let roomId: string;
          let appId: string;
          let userName: string;
          let userId: string;

          if (isOwner && user) {
            // Creator flow: try to start session first
            try {
              const startResponse: StartSessionResponse = await startSession(sessionId);
              // StartSessionResponse has creatorToken, not token
              token = startResponse.data.creatorToken;
              role = 'host'; // Creators are always hosts
              roomId = startResponse.data.roomId;
              appId = startResponse.data.appId;
              userName = `${user.firstname} ${user.lastname}`.trim();
              userId = user.id;
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : '';
              if (errorMsg.includes('already live') || errorMsg.includes('already started')) {
                // If already live, join instead to get active tokens
                const joinResponse: JoinSessionResponse = await joinSession(sessionId);
                token = joinResponse.data.token;
                role = joinResponse.data.role;
                roomId = joinResponse.data.roomId;
                appId = joinResponse.data.appId;
                userName = joinResponse.data.userInfo.displayName;
                userId = user.id;
              } else {
                throw err;
              }
            }
          } else {
            // Participant flow: join session
            if (!user) {
              throw new Error('User must be logged in to join session');
            }
            const joinResponse: JoinSessionResponse = await joinSession(sessionId);
            token = joinResponse.data.token;
            role = joinResponse.data.role;
            roomId = joinResponse.data.roomId;
            appId = joinResponse.data.appId;
            userName = joinResponse.data.userInfo.displayName;
            userId = user.id;
          }

          if (!mounted) return;

          // Map series credentials to match JoinRoomResponse structure
          setRoomData({
            action: "JOIN",
            data: {
              roomId,
              appId: Number(appId),
              token,
              role,
              userId,
              userName,
              liveClass: {
                id: session.id,
                title: session.series ? `${session.series.title} - Session ${session.sessionNumber}` : `Session ${session.sessionNumber}`,
              }
            }
          });

          // Sync URL with role parameter
          const roleParam = role.toLowerCase() === "host" || role.toLowerCase() === "creator" ? "Host" : "Audience";
          const currentParams = new URLSearchParams(window.location.search);
          if (!currentParams.has("role")) {
            const nextParams = new URLSearchParams(currentParams);
            nextParams.set("role", roleParam);
            router.replace(`${window.location.pathname}?${nextParams.toString()}`, {
              scroll: false,
            });
          }

        } else {
          // ✅ LIVE CLASS FLOW (unchanged - don't break existing functionality)
          const liveClass = await getLiveClass(liveClassId);
          const isOwner = user && String(liveClass.userId) === String(user.id);

          if (isOwner) {
            await startZegoLive(liveClassId);
          }

          const roleParam = isOwner ? "creator" : "participant";
          const res = await joinZegoRoom(liveClassId, roleParam);

          if (!mounted) return;

          if (res.action === "JOIN") {
            const currentParams = new URLSearchParams(window.location.search);
            if (!currentParams.has("role")) {
              const roleDisplay =
                res.data.role.toLowerCase() === "creator" ||
                res.data.role.toLowerCase() === "host"
                  ? "Host"
                  : "Audience";
              router.replace(`${window.location.pathname}?role=${roleDisplay}`, {
                scroll: false,
              });
            }
            // res is a JoinRoomResult. We need to match the action string.
            setRoomData(res as { action: string; data: JoinRoomResponse });
          } else if (res.action === "PAY") {
            router.replace(`/live/join/${liveClassId}?error=payment_required`);
          } else if (res.action === "INVITE") {
            router.replace(`/live/join/${liveClassId}?error=invitation_required`);
          }
        }
      } catch (e: unknown) {
        if (mounted) {
          const errorMsg = e instanceof Error ? e.message : "Failed to join the live room";
          console.error('Room init error:', errorMsg);
          setError(errorMsg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (liveClassId && !userLoading) init();

    return () => {
      mounted = false;
    };
  }, [liveClassId, router, user, userLoading, isSeries, searchParams]);

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-lg">Securing your connection...</p>
        </div>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-gray-400 max-w-md mb-8">
          {error || "You do not have permission to access this live session."}
        </p>
        <Button onClick={() => router.push(fromCommunityId ? `/dashboard/community/${fromCommunityId}` : isSeries ? "/dashboard/classes" : `/signin?redirect=/live/${liveClassId}`)} >
          {isSeries ? "Back to Dashboard" : "Go to Sign In"}
        </Button>
      </div>
    );
  }

  const isHost =
    roomData.data.role.toLowerCase() === "creator" ||
    roomData.data.role.toLowerCase() === "host";

  return (
    <div className="min-h-screen bg-black relative">
      {isHost && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-4 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
          <Link
            href={fromCommunityId ? `/dashboard/community/${fromCommunityId}` : "/dashboard"}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeftIcon />
          </Link>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">
              {roomData.data.liveClass?.title || "Live Session"}
            </h1>
            <p className="text-white/60 text-xs italic">
              Host Mode (Uninterrupted)
            </p>
          </div>
        </div>
      )}

      <LiveStream
        liveClassId={liveClassId}
        token={roomData.data.token}
        roomId={roomData.data.roomId}
        appId={Number(roomData.data.appId)}
      />
    </div>
  );
}