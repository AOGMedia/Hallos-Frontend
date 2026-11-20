import type { Metadata } from "next";
import { FeedbackPage } from "@/features/class-feedback";

// Personal links: never indexed, and never passed on to other sites.
export const metadata: Metadata = {
  title: "Class feedback",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ClassFeedbackRoute({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ continue?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  // ?continue=1: they just rated on the class-ended screen; carry on from there.
  return <FeedbackPage token={token} resume={query.continue === "1"} />;
}
