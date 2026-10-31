import type { Metadata } from 'next';
import { NO_INDEX, sectionTitle } from '@/lib/metadata';

// Live class links require sign-in. noindex (not a robots.txt block) so share previews keep working.
export const metadata: Metadata = {
  title: sectionTitle('Live class'),
  robots: NO_INDEX,
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
