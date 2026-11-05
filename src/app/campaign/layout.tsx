import type { Metadata } from 'next';
import { NO_INDEX, sectionTitle } from '@/lib/metadata';

// Post-payment campaign screens: transactional.
export const metadata: Metadata = {
  title: sectionTitle('Campaign'),
  robots: NO_INDEX,
};

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return children;
}
