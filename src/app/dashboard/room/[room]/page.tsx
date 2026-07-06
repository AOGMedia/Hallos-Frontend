import RoomComponent from "@/components/zego-room/RoomComponent";

const Room = async ({ params }: { params: Promise<{ room: string }> }) => {
  const roomid = (await params).room;
  // @ts-expect-error Legacy implementation missing props
  return <RoomComponent roomId={roomid} />;
};

export default Room;
