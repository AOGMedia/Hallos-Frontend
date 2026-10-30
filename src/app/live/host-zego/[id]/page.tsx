import HostClient from "./HostClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ZegoHostPage({ params }: PageProps) {
  const { id } = await params;

  return <HostClient liveClassId={id} />;
}
