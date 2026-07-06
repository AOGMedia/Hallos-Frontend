import HostClient from "./HostClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ZegoHostPage({ params }: PageProps) {
  const { id } = await params;

  return <HostClient liveClassId={id} />;
}
