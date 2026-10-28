"use client";

import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useRef, useEffect, useMemo, useState } from "react";
import { endZegoLive, sendZegoHeartbeat } from "@/services/zegoService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ZegoSuperBoardManager } from "zego-superboard-web";
import { RaiseHandButton } from "./RaiseHandButton";
import { RaiseHandPanel } from "./RaiseHandPanel";
import { CustomAlert } from "./CustomAlert";

interface LiveStreamProps {
  liveClassId: string;
  token: string;
  roomId: string;
  appId: number;
  /**
   * Server-verified: the signed-in user owns this class. Only the owner gets
   * host controls by default and can end the class — never inferred from the
   * URL, which anyone can edit.
   */
  isCreator?: boolean;
  /** Series sessions are ended through the series flow, not end-zegocloud. */
  isSeries?: boolean;
}

/** How often the host's browser tells the backend it is still in the room. */
const HEARTBEAT_INTERVAL_MS = 20_000;

type RoleName = "Host" | "Cohost" | "Audience";

const LiveStream = ({ liveClassId, token, roomId, appId, isCreator = false, isSeries = false }: LiveStreamProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, userFirstName, userLastName } = useCurrentUser();

  const fullName = `${userFirstName || "User"} ${userLastName || ""}`.trim();

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zpRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const mountedRef = useRef(false);
  /** True while this component tears the room down itself (unmount / re-init). */
  const tearingDownRef = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [raiseRequests, setRaiseRequests] = React.useState<any[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "info" | "warning" | "error" } | null>(null);
  const [hostLeft, setHostLeft] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ending, setEnding] = useState(false);

  // The owner is always Host. Others get Co-host only through a co-host
  // invite link; everyone else is Audience. A missing or edited ?role= can
  // never grant host controls (it used to default to Host).
  const urlRole = searchParams.get("role");
  const role_str: RoleName = isCreator ? "Host" : urlRole === "Cohost" ? "Cohost" : "Audience";
  const role =
    role_str === "Host"
      ? ZegoUIKitPrebuilt.Host
      : role_str === "Cohost"
      ? ZegoUIKitPrebuilt.Cohost
      : ZegoUIKitPrebuilt.Audience;

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const sharedLinks = useMemo(() => {
    // Only Host should see share links
    if (role_str !== "Host") return [];

    // Clone existing params (THIS preserves type=series etc.)
    const params = new URLSearchParams(searchParams.toString());

    // Build correct join route (not host-zego route)
    const baseJoinUrl = `${origin}/live/${liveClassId}/room`;

    const buildUrl = (newRole: string) => {
      const newParams = new URLSearchParams(params.toString());
      newParams.set("role", newRole); // only change role
      return `${baseJoinUrl}?${newParams.toString()}`;
    };

    return [
      { name: "Join as co-host", url: buildUrl("Cohost") },
      { name: "Join as audience", url: buildUrl("Audience") },
    ];
  }, [role_str, searchParams, origin, liveClassId]);

  // Values read once when the room is created. Kept in refs so a later change
  // (the URL gaining ?role=, the user's name loading) doesn't tear the live
  // room down and rebuild it — rebuilding used to fire onLeaveRoom, which
  // ended the class for everyone while the host was still streaming.
  const fullNameRef = useRef(fullName);
  const sharedLinksRef = useRef(sharedLinks);
  useEffect(() => {
    fullNameRef.current = fullName;
    sharedLinksRef.current = sharedLinks;
  }, [fullName, sharedLinks]);

  useEffect(() => {
    mountedRef.current = true;
    tearingDownRef.current = false;

    if (initializingRef.current || zpRef.current || !containerRef.current || !token) {
      return;
    }

    initializingRef.current = true;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
      appId,
      token,
      roomId,
      userId?.toString() || "",
      fullNameRef.current
    );
    const initZego = async () => {
      try {
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;
        zp.addPlugins({ ZegoSuperBoardManager });

        await zp.joinRoom({
          container: containerRef.current!,
          showRemoveUserButton: role_str === "Host",
          showInviteToCohostButton: role_str === "Host",
          showTurnOffRemoteMicrophoneButton: role_str !== "Audience",
          showTurnOffRemoteCameraButton: role_str !== "Audience",
          showRequestToCohostButton: role_str === "Audience",
          showRoomTimer: true,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
            config: { role },
          },
          sharedLinks: sharedLinksRef.current,
          onInRoomCommandReceived: (_fromUser, command) => {
            try {
              const data = typeof command === "string" ? JSON.parse(command) : command;

              switch (data.type) {
                case "RAISE_HAND":
                  if (role_str === "Host") {
                    setRaiseRequests((prev) => {
                      // Avoid duplicates
                      if (prev.some((r) => r.userId === data.userId)) {
                        return prev;
                      }
                      return [...prev, data];
                    });
                  }
                  break;

                case "ALLOW_SPEAK":
                  if (data.targetUserId === userId?.toString()) {
                    setAlert({
                      message: "Host has allowed you to speak. You can now unmute your microphone.",
                      type: "success",
                    });
                  }
                  break;

                case "REJECT_SPEAK":
                  if (data.targetUserId === userId?.toString()) {
                    setAlert({
                      message: "Host has declined your request to speak.",
                      type: "warning",
                    });
                  }
                  break;

                case "REMOVE_RAISE_HAND":
                  if (role_str === "Host") {
                    setRaiseRequests((prev) => prev.filter((r) => r.userId !== data.userId));
                  }
                  break;
              }
            } catch (error) {
              console.error("Error processing room command:", error);
            }
          },
          onLeaveRoom: () => {
            // Our own teardown (navigation, re-render) is not the host leaving.
            if (tearingDownRef.current || !mountedRef.current) return;
            // Leaving no longer ends the class automatically: attendees and
            // co-hosts may still be in the room. The host decides explicitly.
            if (isCreator) setHostLeft(true);
          },
        });
      } catch (err) {
        console.error("Zego init error:", err);
        zpRef.current = null;
        initializingRef.current = false;
      }
    };

    initZego();

    return () => {
      mountedRef.current = false;
      tearingDownRef.current = true;

      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
      initializingRef.current = false;
    };
    // Only a new room/session (or a different role) should rebuild the room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, roomId, appId, userId, role_str]);

  // Host heartbeat: keeps the class marked live while the host is in the room
  // and lets the backend recover a class that was wrongly marked ended.
  // Stops as soon as the host leaves the room.
  useEffect(() => {
    if (!isCreator || isSeries || hostLeft || !roomId) return;

    let cancelled = false;
    const beat = async () => {
      try {
        const result = await sendZegoHeartbeat(liveClassId, roomId);
        if (!cancelled && result?.recovered) {
          console.info("[LiveStream] Class status recovered to live by host heartbeat");
        }
      } catch {
        // Best-effort: a missed heartbeat is retried on the next tick.
      }
    };

    beat();
    const timer = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isCreator, isSeries, hostLeft, liveClassId, roomId]);

  const handleEndForEveryone = async () => {
    setEnding(true);
    try {
      await endZegoLive(liveClassId);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to end class:", error);
      setAlert({ message: "Couldn't end the class. Please try again.", type: "error" });
      setEnding(false);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className="w-full h-screen"
        style={{
          background:
            "linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%), #1f2636",
        }}
      />

      {/* Custom Alert */}
      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

      {/* Host - Raise Hand Requests Panel */}
      {role_str === "Host" && !hostLeft && (
        <RaiseHandPanel
          requests={raiseRequests}
          onAllow={(userId) => {
            zpRef.current?.sendInRoomCommand(
              JSON.stringify({
                type: "ALLOW_SPEAK",
                targetUserId: userId,
              }),
              [userId]
            );

            setRaiseRequests((prev) => prev.filter((r) => r.userId !== userId));
          }}
          onDismiss={(userId) => {
            zpRef.current?.sendInRoomCommand(
              JSON.stringify({
                type: "REJECT_SPEAK",
                targetUserId: userId,
              }),
              [userId]
            );

            setRaiseRequests((prev) => prev.filter((r) => r.userId !== userId));
          }}
        />
      )}

      {/* Audience - Raise Hand Button */}
      {role_str === "Audience" && (
        <RaiseHandButton
          onRaiseHand={() => {
            zpRef.current?.sendInRoomCommand(
              JSON.stringify({
                type: "RAISE_HAND",
                userId: userId?.toString(),
                name: fullName,
              }),
              []
            );
          }}
          onLowerHand={() => {
            zpRef.current?.sendInRoomCommand(
              JSON.stringify({
                type: "REMOVE_RAISE_HAND",
                userId: userId?.toString(),
              }),
              []
            );
          }}
        />
      )}

      {/* Host left the room: the class stays live until they choose to end it */}
      {hostLeft && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1f2636] p-6 text-center shadow-2xl">
            {!confirmEnd ? (
              <>
                <h2 className="text-xl font-bold text-white">You left the room</h2>
                <p className="mt-2 text-sm text-white/70">
                  {isSeries
                    ? "This session is still running for attendees in the room."
                    : "Your class is still live for attendees. Rejoin to keep teaching, or end the class for everyone."}
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Rejoin class
                  </button>
                  {isSeries ? (
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="w-full rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition-colors hover:bg-white/5"
                    >
                      Back to dashboard
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmEnd(true)}
                      className="w-full rounded-full border border-red-500/50 px-6 py-3 font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      End class for everyone
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white">End this class for everyone?</h2>
                <p className="mt-2 text-sm text-white/70">
                  Attendees will no longer be able to join. This can&apos;t be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setConfirmEnd(false)}
                    disabled={ending}
                    className="flex-1 rounded-full border border-white/15 px-4 py-3 font-semibold text-white/80 transition-colors hover:bg-white/5 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEndForEveryone}
                    disabled={ending}
                    className="flex-1 rounded-full bg-red-500 px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {ending ? "Ending…" : "End class"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LiveStream;
