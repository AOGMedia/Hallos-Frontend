import React from 'react'
import { TeamSection } from '@/components/sections/TeamSection';
import { buildMetadata } from '@/lib/metadata';
import { fetchInvestorProfiles } from '@/lib/seo/publicApi';
import { TEAM_MEMBERS } from '@/components/team/teamData';

export const metadata = buildMetadata({
  title: 'Investor Relations',
  description:
    'Meet the team building Hallos, the creator economy platform for live learning, and find out how to connect with us about investment and partnerships.',
  path: '/investor-relations',
});

// Profiles are edited in the admin; re-rendered at most every minute so changes show without a deploy.
export const revalidate = 60;

const page = async () => {
  // The built-in profile only if the API can't be reached; an empty list is shown as empty.
  const members = (await fetchInvestorProfiles()) ?? TEAM_MEMBERS;
  return (
    <div className='pt-12 overflow-hidden'>
      <TeamSection members={members} />
    </div>
  )
}

export default page
