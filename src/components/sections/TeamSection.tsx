// Card + "View details" popup are switched off for now: each profile is shown
// in full on the page instead. Uncomment these (and the blocks below) to bring
// the cards back.
// 'use client';
// import { useState } from 'react';
// import { TeamCard } from '@/components/team/TeamCard';
// import { TeamMemberModal } from '@/components/team/TeamMemberModal';
// import type { TeamMember } from '@/components/team/types';
import { TeamMemberProfile } from '@/components/team/TeamMemberProfile';
import { TEAM_MEMBERS } from '@/components/team/teamData';

export function TeamSection() {
  // const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <section id='member' className="py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-10 sm:gap-[60px]">

        {/* Heading block */}
        <div className="flex flex-col gap-4 text-center px-4 sm:px-6 lg:px-10">
          {/* Page heading of /investor-relations (the only page that renders this section) */}
          <h1
            className="font-extrabold leading-tight"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 'clamp(44px, 6vw, 80px)' }}
          >
            <span className="opacity-50">The </span>
            <span style={{ color: 'var(--primary)' }}>future </span>
            <span className="opacity-50">of creators is in </span>
            <span className="gradient-text">safe hands</span>
          </h1>
          {/* <p className="text-sm sm:text-base font-normal" style={{ color: '#888c94' }}>
            Meet our Team Members
          </p> */}
        </div>

        {/* Full profiles */}
        <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-10">
          {TEAM_MEMBERS.map((member, i) => (
            <TeamMemberProfile key={member.id} member={member} priority={i === 0} />
          ))}
        </div>

        {/* Cards row — overflow container spans full width so padding isn't clipped */}
        {/* <div className="overflow-x-auto pb-4 scrollbar-hide">
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
            <div className="shrink-0 w-4 sm:w-6 lg:w-10" aria-hidden="true" />
          </div>
        </div> */}
      </div>

      {/* Modal */}
      {/* {selectedMember && (
        <TeamMemberModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )} */}
    </section>
  );
}
