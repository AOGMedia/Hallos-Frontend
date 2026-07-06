import RoomClient from "./RoomClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ZegoRoomPage({ params }: PageProps) {
  const { id } = await params;

  return <RoomClient liveClassId={id} />;
}
