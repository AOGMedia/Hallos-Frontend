"use client";

import { memo, useEffect } from "react";
import { BackgroundFiltersProvider, useBackgroundFilters } from "@stream-io/video-react-sdk";

export type BlurLevel = "low" | "medium" | "high";

/** What the settings sheet needs to control background effects. */
export interface EffectsControls {
  isSupported: boolean;
  isLoading: boolean;
  degraded: boolean;
  applyBlur: (level: BlurLevel) => void;
  disable: () => void;
}

function Bridge({ onChange }: { onChange: (controls: EffectsControls) => void }) {
  const api = useBackgroundFilters();
  const degraded = Boolean(api.performance?.degraded);

  useEffect(() => {
    onChange({
      isSupported: api.isSupported,
      isLoading: api.isLoading,
      degraded,
      applyBlur: (level) => api.applyBackgroundBlurFilter(level),
      disable: () => api.disableBackgroundFilter(),
    });
    // The API object is recreated on renders; re-publish only when what's shown changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api.isSupported, api.isLoading, degraded, onChange]);

  return null;
}

/**
 * Background blur, mounted only once someone opens the effects settings, so
 * nobody else downloads the segmentation model. It sits beside the room (not
 * around it), so mounting it never re-mounts the video.
 */
export const EffectsHost = memo(function EffectsHost({ onChange }: { onChange: (controls: EffectsControls) => void }) {
  return (
    <BackgroundFiltersProvider SuspenseFallback={null}>
      <Bridge onChange={onChange} />
    </BackgroundFiltersProvider>
  );
});
