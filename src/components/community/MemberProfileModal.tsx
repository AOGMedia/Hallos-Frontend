'use client';

import { X, MapPin, Calendar, FileText, Twitter, Instagram, Mail, Phone, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useMemberProfile } from '@/hooks/useCommunityAPI';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  userId: string | null;
  /** Whether the viewer is a moderator or owner (shows extra fields) */
  isPrivileged: boolean;
}

export function MemberProfileModal({ isOpen, onClose, communityId, userId, isPrivileged }: MemberProfileModalProps) {
  const { data, isLoading } = useMemberProfile(communityId, isOpen ? userId : null);
  const profile = data?.data;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.80)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[480px] rounded-3xl p-6 flex flex-col gap-5"
            style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button onClick={onClose} className="absolute top-4 right-4 text-text-gray hover:text-text-primary transition-colors">
              <X size={18} />
            </button>

            {isLoading || !profile ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  {profile.profilePicture ? (
                    <Image
                      src={profile.profilePicture}
                      alt={`${profile.firstname} ${profile.lastname}`}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                      {profile.firstname?.charAt(0)}{profile.lastname?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-base font-bold text-text-primary">{profile.firstname} {profile.lastname}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border text-text-gray capitalize">
                      {profile.community.role}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-text-gray leading-relaxed">{profile.bio}</p>
                )}

                {/* Public info */}
                <div className="flex flex-col gap-2">
                  {profile.country && (
                    <div className="flex items-center gap-2 text-sm text-text-gray">
                      <MapPin size={14} className="flex-shrink-0" />
                      {profile.country}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-text-gray">
                    <Calendar size={14} className="flex-shrink-0" />
                    Joined {new Date(profile.community.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-gray">
                    <FileText size={14} className="flex-shrink-0" />
                    {profile.community.submissionCount} submission{profile.community.submissionCount !== 1 ? 's' : ''}
                  </div>
                  {profile.socialLinks?.twitter && (
                    <div className="flex items-center gap-2 text-sm text-text-gray">
                      <Twitter size={14} className="flex-shrink-0" />
                      {profile.socialLinks.twitter}
                    </div>
                  )}
                  {profile.socialLinks?.instagram && (
                    <div className="flex items-center gap-2 text-sm text-text-gray">
                      <Instagram size={14} className="flex-shrink-0" />
                      {profile.socialLinks.instagram}
                    </div>
                  )}
                </div>

                {/* Privileged info (moderator/owner only) */}
                {isPrivileged && (profile.email || profile.phoneNumber) && (
                  <div className="flex flex-col gap-2 pt-3 border-t border-border">
                    <p className="text-xs text-text-gray uppercase tracking-wider">Moderator view</p>
                    {profile.email && (
                      <div className="flex items-center gap-2 text-sm text-text-gray">
                        <Mail size={14} className="flex-shrink-0" />
                        {profile.email}
                      </div>
                    )}
                    {profile.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-text-gray">
                        <Phone size={14} className="flex-shrink-0" />
                        {profile.phoneNumber}
                      </div>
                    )}
                    {profile.community.emailNotificationsEnabled !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-text-gray">
                        <Bell size={14} className="flex-shrink-0" />
                        Notifications {profile.community.emailNotificationsEnabled ? 'enabled' : 'disabled'}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
