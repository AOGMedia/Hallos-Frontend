'use client';

import { useMemo, useState } from 'react';
import { GlowTabs, TabOption } from '@/components/ui/GlowTabs';
import UserAddIcon from '@/components/icons/UserAddIcon';
// import BookIcon from '@/components/icons/BookIcon';
// import BookmarkIcon from '@/components/icons/BookmarkIcon';
import CardIcon from '@/components/icons/CardIcon';
import { Globe } from 'lucide-react';
import { SearchSection } from '@/components/sections/SearchSection';
import { ClassTabContent } from '@/components/course/ClassTabContent';

export default function ClassesPage() {
  const [activeTab, setActiveTab] = useState('explore');

  const tabs: TabOption[] = useMemo(() => [
    {
      id: 'explore',
      label: 'Explore Classes',
      icon: <Globe width={20} height={20} className="text-text-primary" />
    },
    {
      id: 'invites',
      label: 'Invites',
      icon: <UserAddIcon width={20} height={18} className="text-text-primary" />
    },
    // {
    //   id: 'registered',
    //   label: 'Registered Classes',
    //   icon: <BookIcon width={20} height={20} className="text-text-primary" />
    // },
    // {
    //   id: 'bookmarks',
    //   label: 'Bookmarks',
    //   icon: <BookmarkIcon width={16} height={20} className="text-text-primary" />
    // },
    {
      id: 'purchases',
      label: 'My Purchases',
      icon: <CardIcon width={20} height={20} className="text-text-primary" />
    }
  ], []);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        
        <div className="mb-8">
          <GlowTabs 
            tabs={tabs} 
            activeTabId={activeTab} 
            onChange={setActiveTab} 
          />
        </div>

        <ClassTabContent activeTab={activeTab} />
      </div>
      <div>
        <SearchSection header1='Can’t find your  ' header2='next class?'/>
      </div>
    </div>
  );
}