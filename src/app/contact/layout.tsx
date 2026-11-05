import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Contact us',
  description:
    'Get in touch with the Hallos team for support, partnerships, creator onboarding or general questions. Email support@hallos.net.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
