/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image';
import { Users, Video, UserPlus, Pencil, Bell, BellOff, LayoutGrid, MoreVertical, Share, VideoIcon, LogOut } from 'lucide-react';
import { ContextMenu } from '@/components/ui/ContextMenu';
import type { Community } from '@/types/community';

interface CommunityHeroProps {
  community: Community;
  isAdmin: boolean;
  isMember: boolean;
  isCreator: boolean;
  role: string;
  showPending: boolean;
  isPendingRequest: boolean;
  joinMutation: any;
  leaveMutation: any;
  toggleNotificationsMutation: any;
  localStorageKey: string;
  onOpenRequests: () => void;
  onShare: () => void;
  onOpenMenu: () => void;
  onOpenSettings?: () => void;
  onOpenUpload: () => void;
  setIsPendingRequest: (v: boolean) => void;
  currentUserName?: string | null;
  contentCount?: number;
}

export function CommunityHero({
  community,
  isAdmin,
  isMember,
  role,
  showPending,
  isPendingRequest,
  joinMutation,
  leaveMutation,
  toggleNotificationsMutation,
  localStorageKey,
  onOpenRequests,
  onShare,
  onOpenMenu,
  onOpenSettings,
  onOpenUpload,
  setIsPendingRequest,
  currentUserName,
  contentCount,
}: CommunityHeroProps) {
  const getInitials = (name?: string | null) => {
    if (!name?.trim()) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  const initials = getInitials(currentUserName);
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Thumbnail with edit icon overlay */}
      <div className="w-full lg:w-[400px] aspect-[4/3] relative rounded-2xl overflow-hidden flex-shrink-0">
        <Image
          src={(community.thumbnailUrl?.trim() || community.thumbnail?.trim()) || '/placeholder-community.jpg'}
          alt={community.name || 'Community'}
          fill
          className="object-cover"
        />
        {isAdmin && (
          <button 
            onClick={onOpenSettings}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {/* Right side */}
      <div className="flex flex-col gap-4 flex-1 justify-between">
        {/* Title + description */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-text-primary">{community.name}</h2>
          <p className="text-sm text-text-gray leading-relaxed">{community.description}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-2 px-3 py-2 rounded-full border border-border text-sm text-text-primary">
            <Users size={14} /> {community.memberCount} members
          </span>
          <span className="flex items-center gap-2 px-3 py-2 rounded-full border border-border text-sm text-text-primary">
            <Video size={14} /> {contentCount ?? community.eventCount} events
          </span>
        </div>

        {/* Avatar row / Join button */}
        {isMember ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(community.memberAvatars || []).slice(0, 6).map((a, i) => (
                <Image
                  width={32}
                  height={32}
                  key={i}
                  src={a || '/placeholder-avatar.jpg'}
                  alt={`Member ${i + 1}`}
                  className="w-8 h-8 rounded-full border-2 border-background-dark object-cover"
                  style={{ marginLeft: i > 0 ? '-8px' : 0 }}
                />
              ))}
              <button className="text-sm text-primary font-medium ml-2 hover:underline">view all</button>
            </div>
            {/* Admin: show pending requests count */}
            {isAdmin && (community.joinRequests || []).length > 0 && (
              <button
                onClick={onOpenRequests}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-sm text-text-primary hover:bg-white/5 transition-colors"
              >
                <UserPlus size={14} className="text-primary" />
                <span className="font-semibold text-primary">+{(community.joinRequests || []).length} new requests</span>
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              if (!community.id || community.name === 'Loading...') return;
              joinMutation.mutate(community.id, {
                onSuccess: () => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem(localStorageKey, 'true');
                  }
                  setIsPendingRequest(true);
                },
                onError: (error: any) => {
                  if (error?.response?.status === 409) {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem(localStorageKey, 'true');
                    }
                    setIsPendingRequest(true);
                  }
                },
              });
              setIsPendingRequest(true);
            }}
            disabled={
              joinMutation.isPending ||
              showPending ||
              !community.id ||
              community.name === 'Loading...'
            }
            className="w-full py-4 rounded-full bg-primary text-white font-bold text-base hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {joinMutation.isPending
              ? 'Requesting...'
              : showPending ||
                (joinMutation.isError && (joinMutation.error as any)?.response?.status === 409)
              ? 'Request pending'
              : 'Request to join'}
          </button>
        )}

        {/* Bottom info bar (members/admins only) */}
        {isMember && (
          <div className="flex items-center justify-between">
            {/* Left: avatar + You + role badge + since */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <span className="text-sm font-medium text-text-primary">You</span>
              <span
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                  isAdmin
                    ? 'border-border text-text-gray'
                    : 'bg-primary/10 border-primary/30 text-primary'
                }`}
              >
                {isAdmin && <Users size={10} />}
                {isAdmin ? (role === 'owner' ? 'Owner' : role === 'moderator' ? 'Moderator' : 'Admin') : 'Member'}
              </span>
              <span className="text-xs text-text-gray">since Mar2026</span>
            </div>
            {/* Right: action icon + 3-dot */}
            <div className="flex items-center gap-2">
              <button
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isAdmin
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'border border-border text-text-gray hover:text-text-primary'
                }`}
                onClick={() => {
                  if (isAdmin) {
                    onOpenMenu();
                  } else {
                    toggleNotificationsMutation.mutate({
                      id: community.id,
                      enabled: !(community as any).emailNotificationsEnabled,
                    });
                  }
                }}
              >
                {isAdmin ? (
                  <LayoutGrid size={16} />
                ) : (community as any).emailNotificationsEnabled ? (
                  <Bell size={16} className="text-primary" />
                ) : (
                  <BellOff size={16} />
                )}
              </button>
              {!isAdmin && (
                <ContextMenu
                  align="end"
                  side="top"
                  trigger={
                    <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-gray hover:text-text-primary transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  }
                  items={[
                    {
                      icon: <Share size={15} />,
                      label: 'Share link',
                      onClick: onShare,
                    },
                    {
                      icon: <VideoIcon size={15} />,
                      label: 'Submit Content',
                      onClick: onOpenUpload,
                    },
                    {
                      icon: <LogOut size={15} />,
                      label: isPendingRequest ? 'Cancel request' : 'Exit community',
                      onClick: () => leaveMutation.mutate(community.id),
                      destructive: true,
                    },
                  ]}
                />
              )}
              {isAdmin && (
                <ContextMenu
                  align="end"
                  side="top"
                  trigger={
                    <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-gray hover:text-text-primary transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  }
                  items={[
                    {
                      icon: <Share size={15} />,
                      label: 'Share link',
                      onClick: onShare,
                    },
                    {
                      icon: <VideoIcon size={15} />,
                      label: 'Post Content',
                      onClick: onOpenUpload,
                    },
                    {
                      icon: <LogOut size={15} />,
                      label: 'Exit community',
                      onClick: () => leaveMutation.mutate(community.id),
                      destructive: true,
                    },
                  ]}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
