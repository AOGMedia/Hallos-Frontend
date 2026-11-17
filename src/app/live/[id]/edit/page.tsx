"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getLiveClass } from "@/services/liveClassService";
import { EditClassHeader, EditLiveClassForm } from "@/features/live/edit-class";

const BACK_HREF = "/dashboard/schedule";

/** Edit a live class. Only its creator gets the form; anyone else goes to the class page. */
export default function EditLiveClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();

  const { data: liveClass, isLoading, error } = useQuery({
    queryKey: ["live-class-edit", id],
    queryFn: () => getLiveClass(id),
    enabled: !!id,
    staleTime: 0,
  });

  const isCreator = !!user && !!liveClass && String(liveClass.userId) === String(user.id);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace(`/signin?redirect=${encodeURIComponent(`/live/${id}/edit`)}`);
    } else if (liveClass && !isCreator) {
      router.replace(`/live/${id}`);
    }
  }, [userLoading, user, liveClass, isCreator, id, router]);

  const ready = !isLoading && !userLoading && !!liveClass && isCreator;

  return (
    <div className="min-h-[100dvh] bg-background-darker px-4 pb-10 pt-[max(env(safe-area-inset-top),16px)]">
      <div className="mx-auto max-w-3xl">
        {ready ? (
          <EditLiveClassForm liveClass={liveClass} backHref={BACK_HREF} />
        ) : (
          <>
            <EditClassHeader onBack={() => router.push(BACK_HREF)} />
            {isLoading || userLoading || liveClass ? (
              <div className="flex min-h-[40vh] items-center justify-center" aria-label="Loading">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
              </div>
            ) : (
              <div className="rounded-3xl border border-border/20 bg-background-card p-6 text-center">
                <p className="mb-4 text-text-muted">
                  {error ? "We couldn't load this class." : "This class doesn't exist."}
                </p>
                <Link href={BACK_HREF} className="text-primary underline-offset-4 hover:underline">
                  Back to your classes
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
