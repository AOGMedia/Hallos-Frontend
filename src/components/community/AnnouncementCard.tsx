'use client';

import { memo, useState } from 'react';
import { MessageSquare, Heart, Share2, Pencil, Trash2, Pin, Send, Loader2, X } from 'lucide-react';
import type { Announcement, AnnouncementComment } from '@/types/community';
import Image from 'next/image';
import { useLikeAnnouncement, useAnnouncementComments, useAddComment, useDeleteComment } from '@/hooks/useCommunityAPI';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface AnnouncementCardProps {
  announcement: Announcement;
  communityId: string;
  canManage?: boolean;
  onEdit?: (a: Announcement) => void;
  onDelete?: (id: string) => void;
}

function AuthorAvatar({ author }: { author: Announcement['author'] }) {
  const src = author.profilePicture || author.avatar;
  const initials = author.firstname
    ? `${author.firstname[0]}${author.lastname?.[0] || ''}`.toUpperCase()
    : (author.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A');

  if (src && src !== '/placeholder-avatar.jpg') {
    return <Image width={40} height={40} src={src} alt={author.name || 'Author'} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
      {initials}
    </div>
  );
}

export const AnnouncementCard = memo(({ announcement, communityId, canManage, onEdit, onDelete }: AnnouncementCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const COMMENT_LIMIT = 20;
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null);

  const { user } = useCurrentUser();
  const likeMutation = useLikeAnnouncement();
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  const { data: commentsData, isLoading: commentsLoading } = useAnnouncementComments(
    communityId,
    showComments ? announcement.id : null,
    commentPage
  );

  const comments: AnnouncementComment[] = (() => {
    const raw = commentsData?.data as { comments?: AnnouncementComment[] } | AnnouncementComment[] | undefined;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && Array.isArray(raw.comments)) return raw.comments;
    return [];
  })();

  const commentTotal: number = (() => {
    const raw = commentsData?.data as { total?: number; comments?: AnnouncementComment[] } | undefined;
    if (raw && typeof raw === 'object' && typeof raw.total === 'number') return raw.total;
    return comments.length;
  })();

  const hasMoreComments = commentTotal > commentPage * COMMENT_LIMIT;

  // Track optimistic comment count
  const [optimisticCommentDelta, setOptimisticCommentDelta] = useState(0);
  const displayCommentCount = showComments
    ? commentTotal + optimisticCommentDelta
    : (announcement.comments || 0) + optimisticCommentDelta;

  const [shareCopied, setShareCopied] = useState(false);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {}
  }

  const isLiked = optimisticLiked !== null ? optimisticLiked : (announcement.likedByMe ?? false);
  const likeCount = optimisticCount !== null ? optimisticCount : (announcement.likeCount ?? announcement.likes ?? 0);

  function handleLike() {
    const newLiked = !isLiked;
    setOptimisticLiked(newLiked);
    setOptimisticCount(likeCount + (newLiked ? 1 : -1));
    likeMutation.mutate({ communityId, announcementId: announcement.id }, {
      onError: () => { setOptimisticLiked(null); setOptimisticCount(null); }
    });
  }

  function handleAddComment() {
    if (!commentText.trim()) return;
    setOptimisticCommentDelta(d => d + 1);
    addCommentMutation.mutate({ communityId, announcementId: announcement.id, body: commentText.trim() }, {
      onSuccess: () => setCommentText(''),
      onError: () => setOptimisticCommentDelta(d => d - 1),
    });
  }

  const displayName = announcement.author?.firstname
    ? `${announcement.author.firstname} ${announcement.author.lastname || ''}`.trim()
    : announcement.author?.name || 'Admin';

  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="p-5 flex gap-4">
        <AuthorAvatar author={announcement.author} />
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-sm text-text-primary">{displayName}</span>
              {announcement.isPinned && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(106,87,229,0.12)', color: '#6a57e5' }}>
                  <Pin size={10} /> Pinned
                </span>
              )}
              <span className="text-xs text-text-gray">
                {announcement.timestamp
                  ? (() => { try { return new Date(announcement.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return announcement.timestamp; } })()
                  : ''}
              </span>
            </div>
            {canManage && (
              <div className="flex items-center gap-1">
                <button onClick={() => onEdit?.(announcement)} className="p-1.5 rounded-full hover:bg-white/5 text-text-gray hover:text-text-primary transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => onDelete?.(announcement.id)} className="p-1.5 rounded-full hover:bg-white/5 text-text-gray hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Title — visually prominent */}
          {announcement.title && (
            <h4 className="font-bold text-base text-text-primary leading-snug">{announcement.title}</h4>
          )}

          {/* Body — slightly muted to differentiate from title */}
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(229,229,229,0.75)' }}>
            {announcement.content || announcement.body || ''}
          </p>

          {/* Image — contained, no cropping, max height capped */}
          {announcement.imageUrl && (
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/20" style={{ maxHeight: 220 }}>
              <Image
                src={announcement.imageUrl}
                alt={announcement.title || 'Announcement image'}
                width={700}
                height={220}
                className="w-full h-auto object-contain rounded-2xl"
                style={{ maxHeight: 220 }}
                sizes="(max-width: 768px) 100vw, 700px"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-1">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowComments(v => !v)}
                className={`flex items-center gap-1.5 transition-colors text-sm cursor-pointer ${showComments ? 'text-primary' : 'text-text-gray hover:text-text-primary'}`}
              >
                <MessageSquare size={14} /> {showComments && (<>
                
                {displayCommentCount}
                </>)}
                
              </button>
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`flex items-center gap-1.5 transition-colors text-sm  cursor-pointer  ${isLiked ? 'text-red-400' : 'text-text-gray hover:text-red-400'}`}
              >
                <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} /> {likeCount}
              </button>
            </div>
            <button
                onClick={handleShare}
                className={`transition-colors ${shareCopied ? 'text-green-400' : 'text-text-gray hover:text-text-primary'}`}
                title={shareCopied ? 'Copied!' : 'Copy link'}
              >
                <Share2 size={14} />
              </button>
          </div>
        </div>
      </div>

      {/* Comments section — distinct bg to separate from announcement */}
      {showComments && (
        <div className="flex flex-col gap-4 px-5 py-4" style={{ background: 'rgba(0,0,0,0.20)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Add comment */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
              {user?.firstname?.[0]}{user?.lastname?.[0]}
            </div>
            <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-gray"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || addCommentMutation.isPending}
                className="text-primary disabled:opacity-40 transition-opacity"
              >
                {addCommentMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>

          {/* Comments list */}
          {commentsLoading ? (
            <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-text-gray" /></div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-text-gray text-center py-2">No comments yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {comments.map((c) => {
                const cName = `${c.author.firstname} ${c.author.lastname}`.trim();
                const cInitials = `${c.author.firstname[0]}${c.author.lastname?.[0] || ''}`.toUpperCase();
                const canDelete = canManage || String(c.userId) === String(user?.id);
                return (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {c.author.profilePicture ? (
                      <Image width={28} height={28} src={c.author.profilePicture} alt={cName} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px] flex-shrink-0 mt-0.5">{cInitials}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-text-primary">{cName}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-text-gray">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          {canDelete && (
                            <button
                              onClick={() => {
                                setOptimisticCommentDelta(d => d - 1);
                                deleteCommentMutation.mutate(
                                  { communityId, announcementId: announcement.id, commentId: c.id },
                                  { onError: () => setOptimisticCommentDelta(d => d + 1) }
                                );
                              }}
                              className="p-0.5 text-text-gray hover:text-red-400 transition-colors"
                            >
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(229,229,229,0.80)' }}>{c.body}</p>
                    </div>
                  </div>
                );
              })}
              {hasMoreComments && (
                <button
                  onClick={() => setCommentPage(p => p + 1)}
                  disabled={commentsLoading}
                  className="text-xs text-primary font-medium hover:underline self-start disabled:opacity-50 transition-opacity mt-1"
                >
                  {commentsLoading ? 'Loading...' : `Load more (${commentTotal - commentPage * COMMENT_LIMIT} remaining)`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

AnnouncementCard.displayName = 'AnnouncementCard';
