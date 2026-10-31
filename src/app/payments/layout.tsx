import type { Metadata } from 'next';
import { NO_INDEX, sectionTitle } from '@/lib/metadata';

// Payment verification: transactional, never indexable.
export const metadata: Metadata = {
  title: sectionTitle('Payment'),
  robots: NO_INDEX,
};

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
