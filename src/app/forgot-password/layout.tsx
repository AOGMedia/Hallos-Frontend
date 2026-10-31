import type { Metadata } from 'next';
import { NO_INDEX, sectionTitle } from '@/lib/metadata';

// Account recovery: keep it out of search.
export const metadata: Metadata = {
  title: sectionTitle('Reset your password'),
  robots: NO_INDEX,
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
