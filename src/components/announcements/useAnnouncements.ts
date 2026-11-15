'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  tone: 'info' | 'success' | 'warning';
  dismissible: boolean;
}

const DISMISSED_KEY = 'hallos:dismissed-announcements';

export const readList = (key: string): string[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};
export const writeList = (key: string, list: string[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(list.slice(-50)));
  } catch {}
};

/**
 * The announcements this person should see on the site, newest first, minus
 * the ones they closed on this device. `ready` turns true once we know (the
 * request finished, failed, or they're signed out), so the layout can show
 * the promo bar as the fallback without it flashing first.
 */
export function useAnnouncements() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [dismissed, setDismissed] = useState<string[] | null>(null);
  useEffect(() => setDismissed(readList(DISMISSED_KEY)), []);

  const query = useQuery({
    queryKey: ['announcements', 'active', 'web'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Announcement[] }>('/api/announcements/active', { params: { platform: 'web' } });
      return res.data.data ?? [];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const queue = dismissed ? (query.data ?? []).filter((a) => !a.dismissible || !dismissed.includes(a.id)) : [];
  const ready = dismissed !== null && (!isAuthenticated || !query.isPending || query.isError);

  const dismiss = useCallback(
    (id: string) => {
      setDismissed((current) => {
        const next = [...(current ?? []), id];
        writeList(DISMISSED_KEY, next);
        return next;
      });
    },
    []
  );

  return { items: queue, ready, dismiss };
}
