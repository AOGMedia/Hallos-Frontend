import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ALWAYS_AVAILABLE_PROVIDERS, LIVE_PROVIDERS, type LiveProvider } from "./providers";

type ProviderFlags = Partial<Record<LiveProvider, boolean>>;

/** What a create form is making: a one-time live class or a live series. */
export type LiveContentKind = "class" | "series";

/**
 * Live providers a new class or series can use right now, as reported by the
 * backend (GetStream appears once its keys are configured there). Until the
 * backend answers — or if it can't be reached — only the always-available
 * providers are offered, so a form never offers something the server would
 * refuse. `ready` is true once the backend has answered.
 */
export function useAvailableLiveProviders(kind: LiveContentKind = "class"): {
  providers: readonly LiveProvider[];
  ready: boolean;
} {
  const { data, isSuccess } = useQuery({
    queryKey: ["live", "create-capabilities", "providers"],
    queryFn: async () => {
      const res = await apiClient.get<{ providers?: ProviderFlags; seriesProviders?: ProviderFlags }>(
        "/live/create-capabilities",
        { timeout: 8000 }
      );
      return { class: res.data?.providers ?? {}, series: res.data?.seriesProviders ?? {} };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const flags = data?.[kind];
  const providers = useMemo(
    () =>
      flags
        ? LIVE_PROVIDERS.filter((p) => ALWAYS_AVAILABLE_PROVIDERS.includes(p) || flags[p] === true)
        : ALWAYS_AVAILABLE_PROVIDERS,
    [flags]
  );

  return { providers, ready: isSuccess };
}
