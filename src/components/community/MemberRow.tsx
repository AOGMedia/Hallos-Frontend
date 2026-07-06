import { memo, useState } from 'react';
import { MoreVertical, CheckCircle, X, UserCog, Eye, LogOut } from 'lucide-react';
import type { CommunityMember } from '@/types/community';
import Image from 'next/image';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { MemberProfileModal } from './MemberProfileModal';

interface MemberRowProps {
  member: CommunityMember;
  communityId: string;
  viewerUserId?: string;
  isRequest?: boolean;
  viewerRole?: 'owner' | 'moderator' | 'member' | 'guest';
  moderatorCount?: number;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onUpdateRole?: (id: string, role: 'moderator' | 'member') => void;
  onRemove?: (id: string) => void;
}

export const MemberRow = memo(({ member, communityId, viewerUserId, isRequest, viewerRole = 'member', moderatorCount = 0, onAccept, onDecline, onUpdateRole, onRemove }: MemberRowProps) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const displayName = member.name || 
    (member.user ? `${member.user.firstname || ''} ${member.user.lastname || ''}`.trim() : '') || 
    'Member';
    
  const avatarUrl = member.avatar || member.user?.avatar;
    
  const initials = member.user 
    ? `${member.user.firstname?.charAt(0) || ''}${member.user.lastname?.charAt(0) || ''}`.toUpperCase()
    : member.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'M';

  const targetRole = member.role as string;
  const targetId = String(member.userId || member.user_id || member.user?.id || member.id);

  // Permission rules: owner > moderator > member
  // Only owner can promote/demote moderators
  const canPromote = viewerRole === 'owner' && targetRole === 'member';
  const canDemote = viewerRole === 'owner' && targetRole === 'moderator';
  // Moderators can only remove regular members; owners can remove anyone except themselves
  const canRemove = targetRole !== 'owner' && (
    (viewerRole === 'owner') ||
    (viewerRole === 'moderator' && targetRole === 'member')
  );
  // Edge case: moderator cannot remove themselves if they're the only moderator
  const memberUserId = String(member.userId || member.user_id || member.user?.id || member.id);
  const isSelf = !!viewerUserId && memberUserId === String(viewerUserId);
  const isOnlyModerator = isSelf && targetRole === 'moderator' && moderatorCount <= 1;
  const canActuallyRemove = canRemove && !isOnlyModerator;

  return (
    <>
    <div className="flex items-center gap-4 py-2">
      {avatarUrl && avatarUrl !== '/placeholder-avatar.jpg' ? (
        <Image 
          width={40} 
          height={40} 
          src={avatarUrl} 
          alt={displayName} 
          className="w-10 h-10 rounded-full object-cover flex-shrink-0" 
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
          {initials}
        </div>
      )}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-sm font-semibold text-text-primary truncate">{displayName}</span>
        {member.user?.email && (
          <span className="text-[10px] text-text-gray truncate">{member.user.email}</span>
        )}
        {!isRequest && (
          <span className="text-xs text-text-gray px-2 py-0.5 rounded-full border border-border w-fit capitalize">
            {member.role}
          </span>
        )}
      </div>
    {isRequest ? (
      <div className="flex items-center gap-2">
        <button onClick={() => {
          const targetId = member.userId || member.user_id || member.user?.id || member.id;
          onAccept?.(String(targetId));
        }} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors">
          <CheckCircle size={14} /> Accept
        </button>
        <button onClick={() => {
          const targetId = member.userId || member.user_id || member.user?.id || member.id;
          onDecline?.(String(targetId));
        }} className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-text-gray text-xs font-medium hover:text-text-primary transition-colors">
          <X size={14} /> Decline
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        {/* <button className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs text-text-gray hover:text-text-primary transition-colors">
          <Bell size={12} /> Subscribe
        </button> */}
        <ContextMenu
          align="end"
          side="bottom"
          trigger={
            <button className="text-text-gray hover:text-text-primary transition-colors">
              <MoreVertical size={16} />
            </button>
          }
          items={[
            ...(canPromote || canDemote ? [{
              icon: <UserCog size={15} />,
              label: canDemote ? 'Revoke moderator' : 'Make moderator',
              onClick: () => onUpdateRole?.(targetId, canDemote ? 'member' : 'moderator'),
            }] : []),
            {
              icon: <Eye size={15} />,
              label: 'View profile',
              onClick: () => setProfileOpen(true),
            },
            ...(canActuallyRemove ? [{
              icon: <LogOut size={15} />,
              label: 'Remove',
              onClick: () => onRemove?.(targetId),
              destructive: true as const,
            }] : []),
          ]}
        />
      </div>
    )}
  </div>
  <MemberProfileModal
    isOpen={profileOpen}
    onClose={() => setProfileOpen(false)}
    communityId={communityId}
    userId={targetId}
    isPrivileged={viewerRole === 'owner' || viewerRole === 'moderator'}
  />
  </>
);
});

MemberRow.displayName = 'MemberRow';
