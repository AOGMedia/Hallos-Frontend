import type { Metadata } from 'next';
import { NO_INDEX, sectionTitle } from '@/lib/metadata';

// Personal invite tokens: never indexable.
export const metadata: Metadata = {
  title: sectionTitle('Community invite'),
  robots: NO_INDEX,
};

export default function CommunityInviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
