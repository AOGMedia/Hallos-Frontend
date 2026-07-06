interface Tab {
  id: string;
  label: string;
  isNew?: boolean;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function ProfileTabs({ tabs, activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex gap-1 mb-8 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text-primary hover:bg-background-dark/50'
          }`}
        >
          {tab.label}
          {tab.isNew && (
            <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs px-1.5 py-0.5 rounded-full">
              New
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
