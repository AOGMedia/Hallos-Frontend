"use client";

import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSearchParams } from "next/navigation";
import React, { useRef, useEffect, useMemo, useState } from "react";
import { endZegoLive } from "@/services/zegoService";
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
}

const LiveStream = ({ liveClassId, token, roomId ,appId}: LiveStreamProps) => {
  const searchParams = useSearchParams();
  // const pathname = usePathname();
  const { userId ,userFirstName,userLastName} = useCurrentUser();

  const fullName = `${userFirstName || 'User'} ${userLastName || ''}`.trim();

  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zpRef = useRef<any>(null);
  const initializingRef = useRef(false);
  const mountedRef = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [raiseRequests, setRaiseRequests] = React.useState<any[]>([]);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const role_str = searchParams.get("role") || "Host";
  const role =
    role_str === "Host"
      ? ZegoUIKitPrebuilt.Host
      : role_str === "Cohost"
      ? ZegoUIKitPrebuilt.Cohost
      : ZegoUIKitPrebuilt.Audience;

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  // const currentUrl = `${origin}${pathname}`;


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

  useEffect(() => {
    mountedRef.current = true;

    if (
      initializingRef.current ||
      zpRef.current ||
      !containerRef.current ||
      !token
    ) {
      return;
    }

    initializingRef.current = true;
      const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appId,
        token,
        roomId,
        userId?.toString() || "",
        fullName
      );
      const initZego = async () => {
        try {
          const zp = ZegoUIKitPrebuilt.create(kitToken);
          zpRef.current = zp;
          zp.addPlugins({ZegoSuperBoardManager});

        
        await zp.joinRoom({
          container: containerRef.current!,
          showRemoveUserButton: role_str === "Host",
          showInviteToCohostButton: role_str === "Host",
          showTurnOffRemoteMicrophoneButton: role_str !== "Audience",
          showTurnOffRemoteCameraButton: role_str !== "Audience",
          showRequestToCohostButton: role_str === "Audience",
          showRoomTimer: true,
          // roomID: roomId,
          scenario: {
            mode: ZegoUIKitPrebuilt.VideoConference,
            config: { role },
          },
          sharedLinks,
          // custom from here
          onInRoomCommandReceived: (_fromUser, command) => {
            try {
              const data = typeof command === 'string' ? JSON.parse(command) : command;
              
              switch (data.type) {
                case "RAISE_HAND":
                  if (role_str === "Host") {
                    setRaiseRequests(prev => {
                      // Avoid duplicates
                      if (prev.some(r => r.userId === data.userId)) {
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
                      type: 'success'
                    });
                  }
                  break;
                
                case "REJECT_SPEAK":
                  if (data.targetUserId === userId?.toString()) {
                    setAlert({
                      message: "Host has declined your request to speak.",
                      type: 'warning'
                    });
                  }
                  break;
                
                case "REMOVE_RAISE_HAND":
                  if (role_str === "Host") {
                    setRaiseRequests(prev => prev.filter(r => r.userId !== data.userId));
                  }
                  break;
              }
            } catch (error) {
              console.error('Error processing room command:', error);
            }
          },
          // to here 
          onLeaveRoom: async () => {
            if (role_str === "Host") {
              await endZegoLive(liveClassId);
            }
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

      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [token, roomId, userId, role, liveClassId, appId, fullName, role_str, sharedLinks]);

  return (
    <>
      <div ref={containerRef} className="w-full h-screen"
      style={{
              background: 'linear-gradient(250.32deg, rgba(106,87,229,0.2) 5.32%, rgba(229,87,198,0.2) 95.16%), linear-gradient(249.02deg, rgba(106,87,229,0) 4.59%, rgba(31,38,54,1) 95.53%), #1f2636'
            }} 
            />
       
       {/* custom from here  */}
      {/* Custom Alert */}
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      {/* Host - Raise Hand Requests Panel */}
      {role_str === "Host" && (
        <RaiseHandPanel
          requests={raiseRequests}
          onAllow={(userId) => {
            zpRef.current?.sendInRoomCommand(JSON.stringify({
              type: "ALLOW_SPEAK",
              targetUserId: userId,
            }), [userId]);
            
            setRaiseRequests(prev => prev.filter(r => r.userId !== userId));
          }}
          onDismiss={(userId) => {
            zpRef.current?.sendInRoomCommand(JSON.stringify({
              type: "REJECT_SPEAK",
              targetUserId: userId,
            }), [userId]);
            
            setRaiseRequests(prev => prev.filter(r => r.userId !== userId));
          }}
        />
      )}
      
      {/* Audience - Raise Hand Button */}
      {role_str === "Audience" && (
        <RaiseHandButton
          onRaiseHand={() => {
            zpRef.current?.sendInRoomCommand(JSON.stringify({
              type: "RAISE_HAND",
              userId: userId?.toString(),
              name: fullName,
            }), []);
          }}
          onLowerHand={() => {
            zpRef.current?.sendInRoomCommand(JSON.stringify({
              type: "REMOVE_RAISE_HAND",
              userId: userId?.toString(),
            }), []);
          }}
        />
      )}
      {/* to here  */}
    </>
  );
};

export default LiveStream;
