"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useSignedIn } from "@/hooks/useSignedIn";

/**
 * Top bar with a Back button for signed-in people on public pages (blog,
 * course pages), where the visitor site menu is hidden for them. Sits where
 * that menu would be. Visitors see nothing here — they get the full menu.
 */
export function MemberBackBar({ fallbackHref = "/dashboard" }: { fallbackHref?: string }) {
  const router = useRouter();
  const signedIn = useSignedIn();
  if (!signedIn) return null;

  // Back to wherever they came from; straight to the dashboard if this page
  // was opened on its own (new tab, shared link).
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-black/80 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex touch-manipulation items-center gap-2 rounded-full border border-border bg-white/[0.06] px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-white/10 active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
    </div>
  );
}
