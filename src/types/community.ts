export type CommunityStatus = 'active' | 'pending' | 'suspended' | 'rejected';
export type CommunityRole = 'guest' | 'member' | 'moderator' | 'admin' | 'owner';
export type CommunityTab = 'announcements' | 'live-classes' | 'live-series' | 'resources' | 'videos' | 'members' | 'queue';

export type MemberStatus = 'active' | 'pending';

export interface CommunityMember {
  id: string;
  userId?: string | number;
  user_id?: string | number;
  name?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  status: MemberStatus;
  membershipStatus?: MemberStatus;
  membership_status?: MemberStatus;
  user?: {
    id: string | number;
    firstname?: string;
    lastname?: string;
    email?: string;
    avatar?: string;
  };
}

export interface Announcement {
  id: string;
  author: {
    id?: number | string;
    name: string;
    avatar: string;
    firstname?: string;
    lastname?: string;
    profilePicture?: string;
  };
  title?: string;
  body?: string;
  content: string;
  imageUrl?: string;
  isPinned?: boolean;
  likeCount?: number;
  likedByMe?: boolean;
  timestamp: string;
  comments: number;
  likes: number;
}

export interface AnnouncementComment {
  id: string;
  announcementId: string;
  communityId: string;
  userId: number | string;
  body: string;
  author: {
    id: number | string;
    firstname: string;
    lastname: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  thumbnailUrl?: string;
  memberCount: string;
  eventCount: number;
  memberAvatars: string[];
  role: CommunityRole;
  visibility?: 'public' | 'private';
  status?: CommunityStatus; // community-level status (active, pending, suspended, rejected)
  membershipStatus?: MemberStatus;
  isMember?: boolean;
  announcements: Announcement[];
  members: CommunityMember[];
  joinRequests: CommunityMember[];
}
