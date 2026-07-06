'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import CloseXModalIcon from '@/components/icons/CloseXModalIcon';
import type { TeamMember } from './types';
import { Globe, MapPin } from 'lucide-react';

interface TeamMemberModalProps {
  member: TeamMember;
  onClose: () => void;
}

export function TeamMemberModal({ member, onClose }: TeamMemberModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${member.name} profile`}
    >
      <div
        className="relative flex flex-col sm:flex-row w-full max-w-[1000px] max-h-[90vh] rounded-3xl overflow-hidden scrollbar-hide"
        style={{
          background: 'linear-gradient(0deg, rgba(0,0,0,0.30), rgba(0,0,0,0.30)), #1f2636',
          boxShadow: '-10px 14px 40px rgba(106, 87, 229, 0.30)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          aria-label="Close modal"
        >
          <CloseXModalIcon width={20} height={20} />
        </button>

        {/* Left profile card */}
        <aside
          className="flex flex-col gap-4 sm:gap-6 p-6 w-full sm:w-[300px] sm:shrink-0 overflow-y-auto sm:overflow-visible scrollbar-hide"
          style={{ background: '#1f2636' }}
        >
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[var(--primary)]">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover object-top"
                sizes="96px"
              />
            </div>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-3">
            <h2
              className="text-center font-bold text-2xl leading-7"
              style={{ color: '#f2f2f2' }}
            >
              {member.name}
            </h2>
            <hr style={{ borderColor: 'rgba(234,234,234,0.20)' }} />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <MapPin size={13} color="#888C94" aria-hidden="true" />
              <span className="text-sm font-normal" style={{ color: '#888c94' }}>
                {member.location}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
<Globe size={13} color="#888C94" />
              <a
                href={member.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-normal truncate transition-opacity hover:opacity-80"
                style={{ color: '#888c94' }}
              >
                {member.website}
              </a>
            </div>
            {/* <div className="flex items-center gap-2.5">
              <Image src="/icons/bell-social.svg" alt="" width={12} height={14} aria-hidden="true" />
              <span className="text-sm font-normal" style={{ color: '#888c94' }}>
                {member.subscribers}
              </span>
            </div> */}
          </div>

          {/* Social icons highlight */}
          <div
            className="flex items-center gap-5 px-6 py-3 rounded-[10px]"
            style={{
              background: 'linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04)), #1f2636',
            }}
          >
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} LinkedIn`}
                className="transition-opacity hover:opacity-80"
              >
                <Image src="/icons/linkedin.svg" alt="LinkedIn" width={20} height={20} />
              </a>
            )}
            {member.emailAddress && (
              <a
                href={`mailto:${member.emailAddress}`}
                aria-label={`Email ${member.name}`}
                className="transition-opacity hover:opacity-80"
              >
                <Image src="/icons/email-light-social.svg" alt="Email" width={24} height={20} />
              </a>
            )}
            {member.websiteUrl && (
              <a
                href={member.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} website`}
                className="transition-opacity hover:opacity-80"
              >
<Globe size={18} color="#1DBF53" />
              </a>
            )}
          </div>

          {/* Subscribe button */}
          {/* <button
            className="flex items-center justify-center gap-2 w-full py-4 rounded-full transition-colors hover:bg-white/5"
            style={{
              border: '1.2px solid rgba(234,234,234,0.30)',
              boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.30)',
              background: 'rgba(106,87,229,0.01)',
            }}
            aria-label={`Subscribe to ${member.name}`}
          >
            <img src="/icons/bell-outline-social.svg" alt="" width={18} height={22} aria-hidden="true" />
            <span className="font-bold text-base" style={{ color: 'rgba(229,229,229,0.95)' }}>
              Subscribe
            </span>
          </button> */}
        </aside>

        {/* Right bio content */}
        <div className="flex flex-col gap-4 p-6 overflow-y-auto flex-1 min-w-0 min-h-0 scrollbar-hide">
          {/* Role + Name */}
          <div className="flex flex-col gap-2.5">
            <span
              className="self-start text-xs font-medium px-2 py-0.5 rounded"
              style={{
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
              }}
            >
              {member.role}
            </span>
            <h2
              className="font-bold text-2xl leading-8"
              style={{ color: '#f2f2f2' }}
            >
              {member.name}
            </h2>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-medium" style={{ color: '#888c94' }}>
              Bio
            </span>
            <p
              className="text-base font-medium leading-6 whitespace-pre-line"
              style={{ color: '#eaeaea' }}
            >
              {member.fullBio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
