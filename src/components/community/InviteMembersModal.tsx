'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAddMemberByEmail, useCommunityInviteLink, useRegenerateInvite } from '@/hooks/useCommunityAPI';
import { Link2, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { RegistrationSuccess } from '@/components/event/RegistrationSuccess';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
}

export function InviteMembersModal({ isOpen, onClose, communityId }: InviteMembersModalProps) {
  const [query, setQuery] = useState('');
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [linkCopied, setLinkCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastInvited, setLastInvited] = useState('');
  const [lastInvitedRegistered, setLastInvitedRegistered] = useState(false);

  const { data: inviteLinkRes } = useCommunityInviteLink(communityId);
  const inviteMutation = useAddMemberByEmail();
  const regenerateMutation = useRegenerateInvite();

  const alreadyInvited = invited.has(query.trim().toLowerCase());

  function handleInvite() {
    const email = query.trim().toLowerCase();
    if (!email.includes('@') || alreadyInvited) return;

    inviteMutation.mutate({ id: communityId, email }, {
      onSuccess: (res) => {
        const data = (res as { data?: { email?: string; registered?: boolean } })?.data;
        const sentEmail = data?.email || email;
        const isRegistered = data?.registered === true;

        setInvited(prev => new Set(prev).add(email));
        setLastInvited(sentEmail);
        setQuery('');
        setShowSuccess(true);
        setLastInvitedRegistered(isRegistered);
      },
      onError: (err: Error) => {
        const axiosErr = err as unknown as { response?: { status?: number } };
        if (axiosErr?.response?.status === 409) {
          setInvited(prev => new Set(prev).add(email));
        }
      }
    });
  }

  async function handleCopyLink() {
    const inviteLink = inviteLinkRes?.data?.inviteLink || `${window.location.origin}/dashboard/community/${communityId}`;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {}
  }

  return (
    <>
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
            className="relative w-full max-w-[560px] rounded-3xl p-6 flex flex-col gap-5"
            style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.07)' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Invite members</h2>
                <p className="text-xs text-text-gray mt-0.5">Sent via direct message and email</p>
              </div>
              <button onClick={onClose} className="text-text-gray hover:text-text-primary transition-colors mt-0.5">
                <X size={18} />
              </button>
            </div>

            {/* Search / email input */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ border: `1.5px solid ${alreadyInvited ? '#ef4444' : '#6a57e5'}`, background: 'rgba(106,87,229,0.06)' }}
            >
              <Search size={18} className="text-text-gray flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="Enter email to invite"
                className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-gray"
              />
              <button
                onClick={handleInvite}
                disabled={!query.includes('@') || alreadyInvited || inviteMutation.isPending}
                className="text-xs font-bold text-primary disabled:opacity-40 transition-opacity"
              >
                {inviteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Invite'}
              </button>
            </div>
            {alreadyInvited && (
              <p className="text-xs text-red-400 -mt-3">This email has already been invited.</p>
            )}

            {/* Copy invite link */}
            <div className="flex items-center gap-4">
              <button onClick={handleCopyLink} className="flex items-center gap-2 text-sm font-medium transition-colors w-fit" style={{ color: '#6a57e5' }}>
                <Link2 size={15} />
                {linkCopied ? 'Copied!' : 'copy invite link'}
              </button>
              <button
                onClick={() => regenerateMutation.mutate(communityId)}
                disabled={regenerateMutation.isPending}
                className="flex items-center gap-1.5 text-xs text-text-gray hover:text-text-primary transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={regenerateMutation.isPending ? 'animate-spin' : ''} />
                Regenerate
              </button>
            </div>

            {/* Invited list */}
            {invited.size > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-text-gray">Invited ({invited.size})</p>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {Array.from(invited).map(email => (
                    <span key={email} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                      {email}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {showSuccess && (
      <RegistrationSuccess
        title="Invite Sent!"
        subtitle={`Invitation sent to ${lastInvited}`}
        message={lastInvitedRegistered
          ? "They're already on Hallos and have been added to the community."
          : "They'll receive an email with a link to join the community."}
        onClose={() => setShowSuccess(false)}
        zIndex={20000}
      />
    )}
    </>
  );
}
