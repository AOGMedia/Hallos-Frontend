import React from 'react'
import { TeamSection } from '@/components/sections/TeamSection';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Investor Relations',
  description:
    'Meet the team building Hallos, the creator economy platform for live learning, and find out how to connect with us about investment and partnerships.',
  path: '/investor-relations',
});

const page = () => {
  return (
    <div className='pt-12 overflow-hidden'>
      <TeamSection />
    </div>
  )
}

export default page
