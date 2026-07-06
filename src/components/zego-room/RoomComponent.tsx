"use client";

import dynamic from "next/dynamic";

const LiveStream = dynamic(() => import("@/components/zego-room/LiveStream"), {
  ssr: false,
});

interface RoomComponentProps {
  liveClassId: string;
  token: string;
  roomId: string;
  appId: number;
}

const RoomComponent = ({ liveClassId, token, roomId, appId }: RoomComponentProps) => {
  return <LiveStream liveClassId={liveClassId} token={token} roomId={roomId} appId={appId} />;
};

export default RoomComponent;
