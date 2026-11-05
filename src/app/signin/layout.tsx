import type { Metadata } from 'next';
import { NO_INDEX, sectionTitle } from '@/lib/metadata';

// Sign-in form: nothing to rank, keep it out of search.
export const metadata: Metadata = {
  title: sectionTitle('Log in'),
  robots: NO_INDEX,
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
