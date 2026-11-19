"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRecordingSettings, resetRecordingSettings, saveRecordingSettings } from "../api";
import type { RecordingSettings } from "../lib/recordingSettings";

const KEY = ["getstream-recording-settings"] as const;

/**
 * The creator's saved recording settings. Only fetched while `enabled` (the
 * settings sheet is open), so the room does no extra work otherwise.
 */
export function useRecordingSettings(enabled: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: KEY,
    queryFn: getRecordingSettings,
    enabled,
    staleTime: 5 * 60_000,
  });

  const save = useMutation({
    mutationFn: (settings: RecordingSettings) => saveRecordingSettings(settings),
    onSuccess: (settings) => queryClient.setQueryData(KEY, { settings, saved: true }),
  });

  const reset = useMutation({
    mutationFn: resetRecordingSettings,
    onSuccess: (settings) => queryClient.setQueryData(KEY, { settings, saved: false }),
  });

  return { query, save, reset };
}
