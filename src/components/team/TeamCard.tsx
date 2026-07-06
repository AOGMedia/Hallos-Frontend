'use client';

import Image from 'next/image';
import { getCourseGradient } from '@/lib/courseVisuals';
import type { TeamMember } from './types';
import { Globe } from 'lucide-react';

interface TeamCardProps {
  member: TeamMember;
  onViewDetails: (member: TeamMember) => void;
}

export function TeamCard({ member, onViewDetails }: TeamCardProps) {
  const gradient = getCourseGradient(member.id);

  return (
    <article
      className="relative flex-shrink-0 w-[300px] sm:w-[340px] lg:w-[380px] h-[400px] rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(250, 250, 250, 0.04)',
        border: '0.78px solid rgba(234, 234, 234, 0.20)',
      }}
    >
      {/* Left gradient image panel */}
      <div
        className="absolute left-0 top-0 w-[45%] h-full"
        style={{ background: gradient.gradient }}
        aria-hidden="true"
      />
      <div className="absolute left-0 bottom-0 w-[45%] h-[76%] overflow-hidden">
        <Image
          src={member.image}
          alt={member.name}
          fill
          priority
          quality={90}
          className="object-cover object-top"
          sizes="(max-width: 640px) 40vw, 40vw"
          // sizes="(max-width: 640px) 114px, 145px"
        />
      </div>

      {/* Right details panel */}
      <div className="absolute right-0 top-0 w-[55%] h-full flex flex-col justify-between p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          {/* Role + Name */}
          <div className="flex flex-col gap-2">
            <span
              className="self-start text-xs font-medium px-2 py-0.5 rounded"
              style={{
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
              }}
            >
              {member.role}
            </span>
            <h3 className="heading-card leading-tight line-clamp-1">{member.name}</h3>
          </div>

          {/* About */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-normal" style={{ color: '#888c94' }}>
              About
            </span>
            <p
              className="text-xs font-normal leading-[1.5] line-clamp-6"
              style={{ color: 'var(--text-primary)' }}
            >
              {member.shortBio}
            </p>
          </div>
        </div>

        {/* Bottom: view details + social icons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onViewDetails(member)}
            className="self-start text-xs underline transition-opacity hover:opacity-70  focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: 'var(--primary)' }}
            aria-label={`View details for ${member.name}`}
          >
            View details
          </button>

          <div className="flex items-center gap-2" role="list" aria-label="Social links">
            {member.linkedinUrl && (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                role="listitem"
                aria-label={`${member.name} LinkedIn`}
                className="w-5 h-5 rounded overflow-hidden shrink-0 transition-opacity hover:opacity-80"
              >
                <Image src="/icons/linkedin.svg" alt="LinkedIn" width={20} height={20} />
              </a>
            )}
            {member.emailAddress && (
              <a
                href={`mailto:${member.emailAddress}`}
                role="listitem"
                aria-label={`Email ${member.name}`}
                className="w-6 h-5 shrink-0 transition-opacity hover:opacity-80"
              >
                <Image src="/icons/email-social.svg" alt="Email" width={24} height={20} />
              </a>
            )}
            {member.websiteUrl && (
              <a
                href={member.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                role="listitem"
                aria-label={`${member.name} website`}
                className="w-4.5 h-4.5 shrink-0 transition-opacity hover:opacity-80"
              >
<Globe size={18} color="#1DBF53" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
