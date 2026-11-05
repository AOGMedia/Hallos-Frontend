import type { Metadata } from 'next';
import { NO_INDEX, sectionTitle } from '@/lib/metadata';

// OAuth callback: transient, never indexable.
export const metadata: Metadata = {
  title: sectionTitle('Signing you in'),
  robots: NO_INDEX,
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
