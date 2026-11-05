"use client";

import { useQuery } from "@tanstack/react-query";
import { listEndedGetStreamClasses } from "../api";

/** The signed-in creator's finished GetStream classes. Off when signed out. */
export function useEndedGetStreamClasses(enabled: boolean) {
  return useQuery({
    queryKey: ["live", "getstream-ended-classes"],
    queryFn: listEndedGetStreamClasses,
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}
