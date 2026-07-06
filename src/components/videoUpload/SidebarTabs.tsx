'use client';

// import { Button } from "../ui/Button";

interface SidebarTabsProps {
  activeTab: 'upload' | 'import' | 'shorts';
  onTabChange: (tab: 'upload' | 'import' | 'shorts') => void;
}

export function SidebarTabs({ activeTab, onTabChange }: SidebarTabsProps) {
  const tabs = [
    { id: 'upload' as const, label: 'Upload' },
    { id: 'import' as const, label: 'Import' },
    { id: 'shorts' as const, label: 'Shorts' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`text-regular text-center transition-colors cursor-pointer  ${
            activeTab === tab.id
              ? '  text-text-primary bg-primary py-3  rounded-full'
              : 'text-[#888c94] hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}