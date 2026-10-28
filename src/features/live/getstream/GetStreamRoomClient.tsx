"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  joinGetStreamCall,
  serverMessage,
  startGetStreamLive,
  type GetStreamCredentials,
  type GetStreamTarget,
} from "./api";

// The SDK is only downloaded when someone actually opens a GetStream class.
const GetStreamRoom = dynamic(() => import("./components/GetStreamRoom"), {
  ssr: false,
  loading: () => <FullScreenStatus title="Joining the class…" spinner />,
});

/** Retry a class that reads as inactive for about a minute — same as the ZegoCloud room. */
const INACTIVE_RETRY_MS = 10_000;
const MAX_INACTIVE_RETRIES = 6;

interface GetStreamRoomClientProps {
  /** The live class, or the series session, being joined. */
  target: GetStreamTarget;
  /** Owner of the class/series (from its own data); the server re-checks this. */
  isOwner: boolean;
  title: string;
  backHref: string;
}

function FullScreenStatus({ title, body, spinner }: { title: string; body?: string; spinner?: boolean }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#0d111b] px-6 text-center text-white">
      {spinner && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
      <p className="text-lg">{title}</p>
      {body && <p className="max-w-sm text-sm text-white/60">{body}</p>}
    </div>
  );
}

/**
 * Gets GetStream credentials for the room (the creator starts the class,
 * everyone else joins it), then renders the room.
 */
export function GetStreamRoomClient({ target, isOwner, title, backHref }: GetStreamRoomClientProps) {
  const router = useRouter();
  const { kind, id } = target;
  // Where someone without access is sent: the class lobby, or the series page.
  const lobbyHref = kind === "session" ? backHref : `/live/join/${id}`;
  const [credentials, setCredentials] = useState<GetStreamCredentials | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    let mounted = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      try {
        const target = { kind, id };
        if (isOwner) {
          const creds = await startGetStreamLive(target);
          if (mounted) setCredentials(creds);
          return;
        }
        const res = await joinGetStreamCall(target);
        if (!mounted) return;
        if (res.action === "JOIN") {
          setWaiting(false);
          setCredentials(res.data);
        } else if (res.action === "PAY") {
          router.replace(`${lobbyHref}?error=payment_required`);
        } else {
          router.replace(`${lobbyHref}?error=invitation_required`);
        }
      } catch (e) {
        if (!mounted) return;
        const message = serverMessage(e, "Failed to join the live class");
        // Classes say "not currently active", sessions "not currently live".
        if (/not currently (active|live)/i.test(message) && attempt < MAX_INACTIVE_RETRIES) {
          setWaiting(true);
          retryTimer = setTimeout(() => mounted && setAttempt((n) => n + 1), INACTIVE_RETRY_MS);
          return;
        }
        setWaiting(false);
        setError(message);
      }
    })();

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [kind, id, isOwner, attempt, router, lobbyHref]);

  if (error) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#0d111b] px-6 text-center">
        <h1 className="text-2xl font-bold text-red-400">Can&apos;t join this class</h1>
        <p className="max-w-md text-white/70">{error}</p>
        <button
          type="button"
          onClick={() => router.push(isOwner ? backHref : lobbyHref)}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-white"
        >
          {isOwner ? "Back to dashboard" : "Back to class page"}
        </button>
      </div>
    );
  }

  if (!credentials) {
    return waiting ? (
      <FullScreenStatus
        spinner
        title="Reconnecting to the class…"
        body="The class isn't reachable right now — the host may be rejoining. We'll keep trying for a minute."
      />
    ) : (
      <FullScreenStatus spinner title={isOwner ? "Starting your class…" : "Securing your connection…"} />
    );
  }

  return (
    <GetStreamRoom
      target={target}
      credentials={credentials}
      title={credentials.liveClass?.title || title}
      backHref={backHref}
    />
  );
}
