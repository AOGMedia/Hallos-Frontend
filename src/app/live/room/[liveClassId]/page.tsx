"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ZegoRoomLegacyRedirectPage() {
  const params = useParams();
  const id = params.liveClassId as string;
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/live/${id}/room`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-lg">Redirecting to live room...</p>
      </div>
    </div>
  );
}
