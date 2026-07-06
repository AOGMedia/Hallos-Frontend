'use client';

import { useState } from 'react';
import { TeamCard } from '@/components/team/TeamCard';
import { TeamMemberModal } from '@/components/team/TeamMemberModal';
import { TEAM_MEMBERS } from '@/components/team/teamData';
import type { TeamMember } from '@/components/team/types';

export function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <section id='member' className="py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-[60px]">

        {/* Heading block */}
        <div className="flex flex-col gap-4 text-center px-4 sm:px-6 lg:px-10">
          <h2
            className="font-extrabold leading-tight"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 'clamp(44px, 6vw, 80px)' }}
          >
            <span className="opacity-50">The </span>
            <span style={{ color: 'var(--primary)' }}>future </span>
            <span className="opacity-50">of creators is in </span>
            <span className="gradient-text">safe hands</span>
          </h2>
          {/* <p className="text-sm sm:text-base font-normal" style={{ color: '#888c94' }}>
            Meet our Team Members
          </p> */}
        </div>

        {/* Cards row — overflow container spans full width so padding isn't clipped */}
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div
            className="flex gap-4 px-4 sm:px-6 lg:px-10"
            role="list"
            aria-label="Team members"
            style={{ width: 'max-content' }}
          >
            {TEAM_MEMBERS.map((member) => (
              <div key={member.id} role="listitem">
                <TeamCard member={member} onViewDetails={setSelectedMember} />
              </div>
            ))}
            {/* trailing spacer so last card isn't flush against the edge */}
            <div className="shrink-0 w-4 sm:w-6 lg:w-10" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedMember && (
        <TeamMemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </section>
  );
}
