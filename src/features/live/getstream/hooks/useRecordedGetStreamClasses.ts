"use client";

import { useQuery } from "@tanstack/react-query";
import { listRecordedGetStreamClasses } from "../api";

/** The signed-in creator's finished GetStream classes that have recordings. Off when signed out. */
export function useRecordedGetStreamClasses(enabled: boolean) {
  return useQuery({
    queryKey: ["live", "getstream-recorded-classes"],
    queryFn: listRecordedGetStreamClasses,
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}
