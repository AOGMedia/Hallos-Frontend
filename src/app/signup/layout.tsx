import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Create your free account',
  description:
    'Join Hallos for free. Learn live from top creators, take self-paced courses with certificates, or start teaching and earning from your knowledge.',
  path: '/signup',
});

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
