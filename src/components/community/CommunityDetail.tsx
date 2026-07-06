/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { memo, useMemo, useState } from 'react';
import { ArrowLeft, Search, Share2, Users, Video, Volume2, RefreshCw, Gift, Lock, LayoutGrid, Plus, X, UserPlus, VideoIcon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuModal } from '@/components/ui/MenuModal';
import { InviteMembersModal } from './InviteMembersModal';
import { PostContentModal } from './PostContentModal';
import { UploadFreebiesModal } from '@/components/freebies/UploadFreebiesModal';
import { CommunitySettingsModal } from './CommunitySettingsModal';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';
import {
  useLeaveCommunity,
  useUpdateMemberRole,
  useRemoveMember,
  useApproveJoinRequest,
  useRejectJoinRequest,
  useModerationQueue,
  useMySubmissions,
  useApproveSubmission,
  useRejectSubmission,
  useCommunityAnnouncements,
  useCommunityMembers,
  useCommunityContent,
  useJoinCommunity,
  useDeleteAnnouncement,
  useToggleNotifications,
} from '@/hooks/useCommunityAPI';
import { useVideoModalStore } from '@/store/videoModalStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Community, CommunityTab, Announcement } from '@/types/community';
import { VideoUploadModal } from '@/components/videoUpload';
import { CommunityHero } from './CommunityHero';
import { AnnouncementsTab } from './tabs/AnnouncementsTab';
import { LiveClassesTab } from './tabs/LiveClassesTab';
import { LiveSeriesTab } from './tabs/LiveSeriesTab';
import { ResourcesTab } from './tabs/ResourcesTab';
import { MembersTab } from './tabs/MembersTab';
import { SubmissionsTab } from './tabs/SubmissionsTab';
import { VideosTab } from './tabs/VideosTab';

const TABS: { key: CommunityTab; icon: React.FC<{ size: number }>; label: string }[] = [
  { key: 'announcements', icon: Volume2, label: 'Announcements' },
  { key: 'live-classes', icon: Video, label: 'Live Classes' },
  { key: 'live-series', icon: RefreshCw, label: 'Live Series' },
  { key: 'resources', icon: Gift, label: 'Resources' },
  { key: 'videos', icon: Video, label: 'Videos' },
];

const MEMBER_ONLY_TABS: CommunityTab[] = ['announcements', 'live-classes', 'live-series', 'resources', 'videos', 'queue'];

function LockedOverlay() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Lock size={24} className="text-primary" />
      </div>
      <div>
        <p className="text-base font-semibold text-text-primary">Members only</p>
        <p className="text-sm text-text-gray mt-1">Join this community to access this content</p>
      </div>
    </div>
  );
}

interface CommunityDetailProps {
  community: Community;
  activeTab: CommunityTab;
  onTabChange: (tab: CommunityTab) => void;
  onBack: () => void;
  onShare: () => void;
}

function buildAdminMenuItems(
  community: Community,
  setIsMenuOpen: (v: boolean) => void,
  setIsAnnouncementOpen: (v: boolean) => void,
  setIsInviteOpen: (v: boolean) => void,
  setIsSettingsOpen: (v: boolean) => void,
  onTabChange: (tab: CommunityTab) => void,
  setMembersSubTab: (t: 'members' | 'requests') => void,
  setIsPostContentOpen: (v: boolean) => void,
) {
  return [
    { icon: <Volume2 size={24} />, label: 'Post\nAnnouncements', onClick: () => { setIsMenuOpen(false); setIsAnnouncementOpen(true); } },
    { icon: <UserPlus size={24} />, label: 'Add new', onClick: () => { setIsMenuOpen(false); setIsInviteOpen(true); } },
    { icon: <Users size={24} />, label: `+${(community.joinRequests || []).length} new requests`, onClick: () => { setIsMenuOpen(false); onTabChange('members'); setMembersSubTab('requests'); }, highlighted: (community.joinRequests || []).length > 0, dot: (community.joinRequests || []).length > 0 },
    { icon: <VideoIcon size={24} />, label: 'Post Content', onClick: () => { setIsMenuOpen(false); setIsPostContentOpen(true); } },
    { icon: <Settings size={24} />, label: 'Settings', onClick: () => { setIsMenuOpen(false); setIsSettingsOpen(true); } },
  ];
}

export const CommunityDetail = memo(({ community, activeTab, onTabChange, onBack, onShare }: CommunityDetailProps) => {
  const [membersSubTab, setMembersSubTab] = useState<'members' | 'requests'>('members');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isPostContentOpen, setIsPostContentOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isPendingRequest, setIsPendingRequest] = useState(false);

  const localStorageKey = `pending_community_${community.id}`;

  const { isUploadModalOpen, closeUploadModal } = useVideoModalStore();
  const { user } = useCurrentUser();

  const earlyUserIdStr = user?.id ? String(user.id) : null;
  const earlyRole = (community as any).memberRole || (community as any).member_role || community.role;
  const earlyIsCreator = !!(earlyUserIdStr && (
    (community as any).createdBy?.toString() === earlyUserIdStr ||
    (community as any).creatorId?.toString() === earlyUserIdStr ||
    (community as any).ownerId?.toString() === earlyUserIdStr
  ));
  const earlyIsAdmin = earlyRole === 'owner' || earlyRole === 'admin' || earlyRole === 'moderator' || earlyIsCreator;

  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();
  const approveRequestMutation = useApproveJoinRequest();
  const rejectRequestMutation = useRejectJoinRequest();
  const approveSubmissionMutation = useApproveSubmission();
  const rejectSubmissionMutation = useRejectSubmission();
  const deleteAnnouncementMutation = useDeleteAnnouncement();
  const toggleNotificationsMutation = useToggleNotifications();

  const { data: announcementsRes } = useCommunityAnnouncements(community.id);
  const { data: membersRes } = useCommunityMembers(community.id);
  const { data: contentRes } = useCommunityContent(community.id);
  const { data: queueResponse } = useModerationQueue(community.id, earlyIsAdmin);
  const { data: mySubmissionsResponse } = useMySubmissions(community.id, !earlyIsAdmin);

  const announcements = useMemo(() => {
    const raw = announcementsRes?.data;
    const list: any[] = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as any).announcements)
        ? (raw as any).announcements
        : (community.announcements || []);
    return list.map((a: any) => ({
      ...a,
      content: a.content || a.body || '',
      timestamp: a.timestamp || a.createdAt || '',
      author: a.author || {
        name: a.authorName || a.creatorName || 'Admin',
        avatar: a.authorAvatar || a.creatorAvatar || '',
      },
      comments: a.comments ?? 0,
      likes: a.likes ?? 0,
    }));
  }, [announcementsRes, community.announcements]);

  const members = useMemo(() => {
    const raw = membersRes?.data;
    const list = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' && Array.isArray((raw as any).members)) ? (raw as any).members : (community.members || []);
    return list.filter((m: any, i: number, arr: any[]) => m && arr.findIndex(x => x.id === m.id) === i);
  }, [membersRes, community.members]);

  const joinRequests = useMemo(() => {
    const fromCommunity = community.joinRequests || [];
    const fromMembers = members.filter((m: any) => m.status === 'pending' || m.membershipStatus === 'pending' || m.membership_status === 'pending');
    const combined = [...fromCommunity, ...fromMembers];
    return combined.filter((m: any, i: number, arr: any[]) =>
      m && arr.findIndex(x => (x.id === m.id || (x.userId && x.userId === m.userId))) === i
    );
  }, [community.joinRequests, members]);

  const communityContent = useMemo(() => {
    const raw = contentRes?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      const combined: any[] = [];
      if (Array.isArray((raw as any).videos)) combined.push(...(raw as any).videos.map((v: any) => ({ ...v, contentType: 'video' })));
      if (Array.isArray((raw as any).liveClasses)) combined.push(...(raw as any).liveClasses.map((v: any) => ({ ...v, contentType: 'class' })));
      if (Array.isArray((raw as any).liveSeries)) combined.push(...(raw as any).liveSeries.map((v: any) => ({ ...v, contentType: 'series' })));
      if (Array.isArray((raw as any).freebies)) combined.push(...(raw as any).freebies.map((v: any) => ({ ...v, contentType: 'resource' })));
      if (combined.length > 0) return combined;
    }
    return [];
  }, [contentRes]);

  const extractSubmissions = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw.submissions)) return raw.submissions;
      for (const key of ['items', 'data', 'queue']) {
        if (Array.isArray(raw[key])) return raw[key];
      }
    }
    return [];
  };

  const queueItems = useMemo(() => extractSubmissions(queueResponse?.data), [queueResponse]);
  const mySubmissions = useMemo(() => extractSubmissions(mySubmissionsResponse?.data), [mySubmissionsResponse]);

  const userIdStr = user?.id ? String(user.id) : null;

  const memberRecord = members.find((m: any) =>
    (m.id && String(m.id) === userIdStr) ||
    (m.userId && String(m.userId) === userIdStr) ||
    (m.user_id && String(m.user_id) === userIdStr)
  );

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

  const role = memberRecord?.role || (community as any).memberRole || (community as any).member_role || community.role || (isCreator ? 'owner' : 'guest');

  const isPendingBackend = useMemo(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(localStorageKey) === 'true') {
      return true;
    }
    const s = (
      community.membershipStatus ||
      (community as any).membership_status ||
      (community as any).status ||
      community.role
    )?.toString().toLowerCase();
    if (s === 'pending') return true;
    if (memberRecord && (
      memberRecord.status?.toLowerCase() === 'pending' ||
      (memberRecord as any).membershipStatus?.toLowerCase() === 'pending' ||
      (memberRecord as any).membership_status?.toLowerCase() === 'pending'
    )) return true;
    const requestsList = (community.joinRequests || []).concat(
      members.filter((m: any) => m.status === 'pending' || m.membershipStatus === 'pending')
    );
    return requestsList.some((m: any) =>
      (m.id && String(m.id) === userIdStr) ||
      (m.userId && String(m.userId) === userIdStr) ||
      (m.user_id && String(m.user_id) === userIdStr)
    );
  }, [community, members, memberRecord, userIdStr, localStorageKey]);

  useMemo(() => {
    if (typeof window !== 'undefined' && (community.isMember || (memberRecord && memberRecord.status === 'active'))) {
      localStorage.removeItem(localStorageKey);
    }
  }, [community.isMember, memberRecord, localStorageKey]);

  const showPending = isPendingRequest || isPendingBackend;

  const isAdmin = role === 'owner' || role === 'admin' || role === 'moderator' || isCreator;
  const isMember = isAdmin || ((community.isMember === true || (community.isMember === undefined && (role === 'member' || !!memberRecord))) && !showPending);

  const allTabs = isAdmin
    ? [...TABS, { key: 'members' as CommunityTab, icon: Users, label: 'Members' }, { key: 'queue' as CommunityTab, icon: LayoutGrid, label: 'Queue' }]
    : isMember
    ? [...TABS, { key: 'queue' as CommunityTab, icon: LayoutGrid, label: 'Submissions' }]
    : TABS;

  const isLocked = (tab: CommunityTab) => !isMember && MEMBER_ONLY_TABS.includes(tab);

  const adminMenuItems = buildAdminMenuItems(
    community, setIsMenuOpen, setIsAnnouncementOpen, setIsInviteOpen, setIsSettingsOpen,
    onTabChange, setMembersSubTab, setIsPostContentOpen,
  );

  return (
    <motion.div className="flex flex-col gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Pending community banner */}
      {(community as any).status === 'pending' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium"
          style={{ background: 'rgba(217,200,15,0.08)', border: '1px solid rgba(217,200,15,0.25)', color: '#d9c80f' }}>
          <span>⏳</span>
          <span>This community is awaiting admin approval. You can edit details or delete it while it&apos;s pending.</span>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <button onClick={onBack} className="text-text-gray hover:text-text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-text-primary truncate">{community.name}</h1>
          <div className="flex items-center gap-3">
            {isMember && (
              <button
                onClick={() => isAdmin ? setIsMenuOpen(true) : setIsPostContentOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <Plus size={16} strokeWidth={3} />
                <span className="hidden xs:inline">Post</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <button onClick={onShare} className="text-text-gray hover:text-text-primary transition-colors"><Share2 size={20} /></button>
              <button className="text-text-gray hover:text-text-primary transition-colors"><Search size={20} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero */}
      <CommunityHero
        community={community}
        isAdmin={isAdmin}
        isMember={isMember}
        isCreator={isCreator}
        role={role}
        showPending={showPending}
        isPendingRequest={isPendingRequest}
        joinMutation={joinMutation}
        leaveMutation={leaveMutation}
        toggleNotificationsMutation={toggleNotificationsMutation}
        localStorageKey={localStorageKey}
        onOpenRequests={() => { onTabChange('members'); setMembersSubTab('requests'); }}
        onShare={onShare}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenUpload={() => setIsPostContentOpen(true)}
        setIsPendingRequest={setIsPendingRequest}
        currentUserName={user ? `${(user as any).firstname || ''} ${(user as any).lastname || ''}`.trim() || (user as any).name || (user as any).username || null : null}
        contentCount={communityContent.filter((c: any) => ['class', 'live_class', 'series', 'live_series'].includes(c.contentType)).length}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-hide">
        {allTabs.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => onTabChange(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === key ? 'text-text-primary border-text-primary' : 'text-text-gray border-transparent hover:text-text-primary'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {isLocked(activeTab) ? <LockedOverlay /> : (
            <>
              {activeTab === 'announcements' && (
                <AnnouncementsTab
                  announcements={announcements}
                  isAdmin={isAdmin}
                  communityId={community.id}
                  onEdit={(ann) => { setEditingAnnouncement(ann); setIsAnnouncementOpen(true); }}
                  onDelete={(id) => {
                    if (confirm('Are you sure you want to delete this announcement?')) {
                      deleteAnnouncementMutation.mutate({ id: community.id, announcementId: id });
                    }
                  }}
                />
              )}
              {activeTab === 'live-classes' && (
                <LiveClassesTab communityContent={communityContent} currentUserId={userIdStr ?? undefined} />
              )}
              {activeTab === 'live-series' && (
                <LiveSeriesTab communityContent={communityContent} />
              )}
              {activeTab === 'resources' && (
                <ResourcesTab communityContent={communityContent} />
              )}
              {activeTab === 'videos' && (
                <VideosTab communityContent={communityContent} />
              )}
              {activeTab === 'members' && (
                <MembersTab
                  community={community}
                  members={members}
                  joinRequests={joinRequests}
                  isAdmin={isAdmin}
                  viewerRole={role as 'owner' | 'moderator' | 'member' | 'guest'}
                  viewerUserId={userIdStr ?? undefined}
                  membersSubTab={membersSubTab}
                  setMembersSubTab={setMembersSubTab}
                  onApproveRequest={(id) => approveRequestMutation.mutate({ id: community.id, userId: id })}
                  onDeclineRequest={(id) => rejectRequestMutation.mutate({ id: community.id, userId: id })}
                  onUpdateRole={(id, newRole) => updateRoleMutation.mutate({ id: community.id, userId: id, role: newRole })}
                  onRemoveMember={(id) => removeMemberMutation.mutate({ id: community.id, userId: id })}
                />
              )}
              {activeTab === 'queue' && (
                <SubmissionsTab
                  isAdmin={isAdmin}
                  mySubmissions={mySubmissions}
                  queueItems={queueItems}
                  communityId={community.id}
                  onApproveSubmission={(submissionId) => approveSubmissionMutation.mutate({ id: community.id, submissionId })}
                  onRejectSubmission={(submissionId, reason) => rejectSubmissionMutation.mutate({ id: community.id, submissionId, reason })}
                />
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {isAdmin && (
        <MenuModal
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          items={adminMenuItems}
        />
      )}
      {isAdmin && (
        <InviteMembersModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          communityId={community.id}
        />
      )}
      {/* PostContentModal — available to all members */}
      {isMember && (
        <PostContentModal
          isOpen={isPostContentOpen}
          onClose={() => setIsPostContentOpen(false)}
          communityId={community.id}
          isAdmin={isAdmin}
        />
      )}
      {/* UploadFreebiesModal — opened by PostContentModal when freebie is selected */}
      <UploadFreebiesModal title="Upload Resource to Community" />
      {isAdmin && (
        <CommunitySettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          community={community}
        />
      )}
      {isAdmin && (
        <CreateAnnouncementModal
          isOpen={isAnnouncementOpen}
          onClose={() => {
            setIsAnnouncementOpen(false);
            setEditingAnnouncement(null);
          }}
          communityId={community.id}
          editAnnouncement={editingAnnouncement ? {
            id: editingAnnouncement.id,
            title: editingAnnouncement.title || '',
            body: editingAnnouncement.content || editingAnnouncement.body || '',
            imageUrl: editingAnnouncement.imageUrl,
            isPinned: editingAnnouncement.isPinned || false,
          } : null}
        />
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/80 overflow-y-auto flex justify-center py-4 md:py-10">
          <div className="relative w-full max-w-7xl mx-auto px-4">
            <button
              onClick={closeUploadModal}
              className="absolute top-0 right-4 md:right-8 z-10 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={24} />
            </button>
            <VideoUploadModal />
          </div>
        </div>
      )}
    </motion.div>
  );
});

CommunityDetail.displayName = 'CommunityDetail';
