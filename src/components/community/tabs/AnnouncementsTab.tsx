/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnnouncementCard } from '@/components/community/AnnouncementCard';

interface AnnouncementsTabProps {
  announcements: any[];
  isAdmin: boolean;
  communityId: string;
  onEdit: (ann: any) => void;
  onDelete: (id: string) => void;
}

export function AnnouncementsTab({ announcements, isAdmin, communityId, onEdit, onDelete }: AnnouncementsTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {announcements.length === 0 ? (
        <p className="text-text-gray text-center py-12">No announcements yet.</p>
      ) : (
        announcements.map((a: any) => (
          <AnnouncementCard
            key={a.id}
            announcement={a}
            communityId={communityId}
            canManage={isAdmin}
            onEdit={(ann) => onEdit(ann)}
            onDelete={(id) => onDelete(id)}
          />
        ))
      )}
    </div>
  );
}
