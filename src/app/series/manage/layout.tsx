import type { Metadata } from 'next';
import { NO_INDEX, sectionTitle } from '@/lib/metadata';

// Creator tooling: signed-in only.
export const metadata: Metadata = {
  title: sectionTitle('Manage series'),
  robots: NO_INDEX,
};

export default function SeriesManageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
