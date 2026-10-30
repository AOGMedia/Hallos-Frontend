import type { Metadata } from 'next';
import PortalProvider from '@/components/email-portal/PortalProvider';

export const metadata: Metadata = {
  title: 'Email Portal | Hallos',
  robots: { index: false, follow: false },
};

export default function EmailPortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalProvider>{children}</PortalProvider>;
}
