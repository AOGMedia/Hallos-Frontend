/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo } from 'react';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import type { Community } from '@/types/community';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface CommunityCardProps {
  community: Community;
  onNavigate: (c: Community) => void;
}

export const CommunityCard = memo(({ community, onNavigate }: CommunityCardProps) => {
  const { user } = useCurrentUser();
  const userIdStr = user?.id ? String(user.id) : null;

  const isCreator = !!(userIdStr && (
    (community as any).creatorId?.toString() === userIdStr || 
    (community as any).ownerId?.toString() === userIdStr ||
    (community as any).creator_id?.toString() === userIdStr ||
    (community as any).owner_id?.toString() === userIdStr ||
    (community as any).userId?.toString() === userIdStr ||
    (community as any).user_id?.toString() === userIdStr ||
    (community as any).user?.id?.toString() === userIdStr ||
    (community as any).creator?.id?.toString() === userIdStr ||
    (community as any).owner?.id?.toString() === userIdStr ||
    (community as any).createdBy?.toString() === userIdStr ||
    (community as any).created_by?.toString() === userIdStr
  ));

  // Community-level status (not membership status)
  const communityStatus = community.status || (community as any).communityStatus || (community as any).community_status;
  const isPendingCommunity = communityStatus === 'pending';

  return (
    <div
      className={`overflow-hidden flex flex-col transition-all ${isPendingCommunity ? 'opacity-80' : 'cursor-pointer hover:opacity-90'}`}
      style={{
        borderRadius: '15px',
        border: isPendingCommunity ? '0.94px solid rgba(217,200,15,0.25)' : '0.94px solid rgba(234,234,234,0.10)',
        background: 'rgba(242,242,242,0.04)',
      }}
    >
      <div className="relative w-full" style={{ height: '192px' }}>
        <Image src={community.thumbnailUrl || community.thumbnail || '/placeholder-community.jpg'} alt={community.name || 'Community'} fill className="object-cover" />
        {/* Pending badge overlay */}
        {isPendingCommunity && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(217,200,15,0.15)', border: '1px solid rgba(217,200,15,0.40)', color: '#d9c80f' }}>
            <Clock size={11} />
            Awaiting approval
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[9.43px] p-4 flex-1">
        {/* Title + description */}
        <div className="flex flex-col gap-[9.43px]">
          <h3 className="text-base font-bold leading-[16px] text-text-primary line-clamp-1">
            {community.name}
          </h3>
          <p className="text-[14px] leading-[21px] font-normal text-[rgba(242,242,242,0.80)] line-clamp-2">
            {community.description}
          </p>
        </div>

        {/* Member avatars + count */}
        <div className="flex items-center gap-[9.43px] px-3 py-1.5 w-fit" style={{ borderRadius: '94px', background: 'transparent' }}>
          <div className="flex" style={{ gap: '-7px' }}>
            {(community.memberAvatars || []).slice(0, 4).map((a, i) => (
              <Image width={24} height={24} key={i} src={a} alt=""
                className="w-6 h-6 object-cover rounded-full border-2 border-background-dark"
                style={{ marginLeft: i > 0 ? '-7px' : 0 }}
              />
            ))}
            <span className="text-xs font-medium leading-[12px] ml-2" style={{ color: '#6a57e5' }}>
              {community.memberCount} Members
            </span>
          </div>
        </div>

        {/* CTA */}
        {isPendingCommunity ? (
          <div className="w-full py-3 text-sm font-semibold text-center rounded-full"
            style={{ background: 'rgba(217,200,15,0.08)', border: '1px solid rgba(217,200,15,0.25)', color: '#d9c80f' }}>
            Under review
          </div>
        ) : (
          <button
            onClick={() => onNavigate(community)}
            className="w-full py-3 text-base font-semibold text-white transition-all hover:opacity-80"
            style={{ background: '#6a57e5', borderRadius: '100px' }}
          >
            {(() => {
              const isLocallyPending = typeof window !== 'undefined' && localStorage.getItem(`pending_community_${community.id}`) === 'true';
              const role = (community as any).memberRole || (community as any).member_role || community.role;
              const mStatus = community.membershipStatus || (community as any).membership_status || (community as any).status;
              const isRealMember = community.isMember === true || isCreator || (role && role !== 'guest') || (mStatus?.toLowerCase() === 'active');
              if (isRealMember) return 'View community';
              if (mStatus?.toLowerCase() === 'pending' || isLocallyPending) return 'Request pending';
              return 'Request to join';
            })()}
          </button>
        )}
      </div>
    </div>
  );
});

CommunityCard.displayName = 'CommunityCard';
