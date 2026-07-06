/* eslint-disable @typescript-eslint/no-explicit-any */
import { MemberRow } from '@/components/community/MemberRow';
import type { Community } from '@/types/community';

interface MembersTabProps {
  community: Community;
  members: any[];
  joinRequests: any[];
  isAdmin: boolean;
  viewerRole: 'owner' | 'moderator' | 'member' | 'guest';
  viewerUserId?: string;
  membersSubTab: 'members' | 'requests';
  setMembersSubTab: (t: 'members' | 'requests') => void;
  onApproveRequest: (id: string) => void;
  onDeclineRequest: (id: string) => void;
  onUpdateRole: (id: string, role: 'moderator' | 'member') => void;
  onRemoveMember: (id: string) => void;
}

export function MembersTab({
  community,
  members,
  joinRequests,
  isAdmin,
  viewerRole,
  viewerUserId,
  membersSubTab,
  setMembersSubTab,
  onApproveRequest,
  onDeclineRequest,
  onUpdateRole,
  onRemoveMember,
}: MembersTabProps) {
  const moderatorCount = members.filter((m: any) => m.role === 'moderator').length;
  return (
    <div className="flex flex-col gap-4">
      {isAdmin && (
        <div className="flex items-center gap-4 border-b border-border pb-2">
          {(['members', 'requests'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMembersSubTab(t)}
              className={`flex items-center gap-2 text-sm font-semibold pb-2 border-b-2 transition-colors capitalize ${
                membersSubTab === t
                  ? 'text-text-primary border-text-primary'
                  : 'text-text-gray border-transparent'
              }`}
            >
              {t === 'requests' ? 'Requests' : 'Members'}
              {t === 'requests' && (community.joinRequests || []).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
      {(!isAdmin || membersSubTab === 'members') && (
        <div className="flex flex-col gap-4">
          {members
            .filter(
              (m: any) =>
                m.status === 'active' ||
                m.membershipStatus === 'active' ||
                !m.status
            )
            .map((m: any) => (
              <MemberRow
                key={m.id || m.userId}
                member={m}
                communityId={community.id}
                viewerRole={viewerRole}
                viewerUserId={viewerUserId}
                moderatorCount={moderatorCount}
                onUpdateRole={isAdmin ? (id, newRole) => onUpdateRole(id, newRole) : undefined}
                onRemove={isAdmin ? (id) => onRemoveMember(id) : undefined}
              />
            ))}
        </div>
      )}
      {membersSubTab === 'requests' && isAdmin && (
        joinRequests.length === 0 ? (
          <p className="text-text-gray text-center py-12">No pending requests.</p>
        ) : (
          joinRequests.map((m) => (
            <MemberRow
              key={m.id || m.userId}
              member={m}
              communityId={community.id}
              isRequest
              onAccept={(id) => onApproveRequest(id)}
              onDecline={(id) => onDeclineRequest(id)}
            />
          ))
        )
      )}
    </div>
  );
}
