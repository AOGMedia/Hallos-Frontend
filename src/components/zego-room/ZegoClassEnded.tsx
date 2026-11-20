"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { EndScreenFeedback } from "@/features/class-feedback/components/EndScreenFeedback";
import { useEndScreenLink } from "@/features/class-feedback/useEndScreenLink";

/**
 * The class-ended screen for ZegoCloud rooms (GetStream has its own), with
 * the "How was it?" feedback.
 *
 * - `ended`: the host just ended the class here, so show it straight away.
 * - `left`: someone left the room (or was dropped when it closed). Shown only
 *   once the backend confirms the class has ended; if it's still running,
 *   ZegoCloud's own "left the room" view (with Rejoin) stays as it was.
 */
export function ZegoClassEnded({
  kind,
  id,
  reason,
}: {
  kind: "class" | "session";
  id: string;
  reason: "ended" | "left";
}) {
  const { data: link } = useEndScreenLink(kind, id);
  if (reason === "left" && !link) return null;

  const noun = kind === "session" ? "session" : "class";
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#0d111b]">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#161c2b] p-6 text-center shadow-2xl">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" aria-hidden />
          <h2 className="mt-3 text-2xl font-bold text-white">This {noun} has ended</h2>
          <p className="mt-2 text-sm text-white/70">
            {link?.role === "host" ? "Nice work. That’s a wrap." : `Thanks for joining the ${noun}.`}
          </p>
          <EndScreenFeedback kind={kind} id={id} />
          <Link
            href="/dashboard"
            className="mt-6 inline-block w-full rounded-full bg-primary px-6 py-3.5 font-semibold text-white transition active:scale-[0.98]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
