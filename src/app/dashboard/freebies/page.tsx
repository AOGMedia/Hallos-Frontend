import { FreebiesPage } from '@/components/freebies/FreebiesPage';
import { Suspense } from 'react';

export default function FreebiesDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FreebiesPage />
    </Suspense>
  );
}
