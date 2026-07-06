import type { CommunityTab } from '@/types/community';

const VALID_TABS: CommunityTab[] = [
  'announcements',
  'live-classes',
  'live-series',
  'resources',
  'members',
];

export function isValidCommunityTab(tab: string): tab is CommunityTab {
  return (VALID_TABS as string[]).includes(tab);
}

export function resolveTab(param: string | undefined): CommunityTab {
  if (param !== undefined && isValidCommunityTab(param)) {
    return param;
  }
  return 'announcements';
}
