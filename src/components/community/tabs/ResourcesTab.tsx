/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FreebieRow } from '@/components/freebies/FreebieRow';

const FreebieDetailModal = dynamic(
  () => import('@/components/freebies/FreebieDetailModal').then(m => m.FreebieDetailModal),
  { ssr: false, loading: () => null }
);

interface ResourcesTabProps {
  communityContent: any[];
}

export function ResourcesTab({ communityContent }: ResourcesTabProps) {
  const [selectedFreebieId, setSelectedFreebieId] = useState<string | null>(null);

  const resources = communityContent.filter(
    (c: any) => c.contentType === 'resource' || c.contentType === 'freebie'
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        {resources.length === 0 ? (
          <p className="text-center text-text-gray py-12">No resources available.</p>
        ) : (
          resources.map((c: any) => {
            const freebie = c.contentData || c;
            return (
              <FreebieRow
                key={c.id}
                freebie={freebie}
                onView={(f) => setSelectedFreebieId(f.id)}
              />
            );
          })
        )}
      </div>
      {selectedFreebieId && (
        <FreebieDetailModal
          freebieId={selectedFreebieId}
          isOpen={!!selectedFreebieId}
          onClose={() => setSelectedFreebieId(null)}
        />
      )}
    </>
  );
}
