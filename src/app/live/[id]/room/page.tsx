import RoomClient from "./RoomClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ZegoRoomPage({ params }: PageProps) {
  const { id } = await params;

  return <RoomClient liveClassId={id} />;
}
