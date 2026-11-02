import { buildMetadata } from '@/lib/metadata';

// noindex: the page is a client-rendered form with no content to rank, and
// links into it carry per-page ?redirect= values. It still gets a proper
// title and share card.
export const metadata = buildMetadata({
  title: 'Create your free account',
  description:
    'Join Hallos for free. Learn live from top creators, take self-paced courses with certificates, or start teaching and earning from your knowledge.',
  path: '/signup',
  noIndex: true,
});

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
