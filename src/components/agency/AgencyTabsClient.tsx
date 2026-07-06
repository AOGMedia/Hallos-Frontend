"use client";

import { useState, lazy, Suspense } from "react";
import { GlowTabs, type TabOption } from "@/components/ui/GlowTabs";
import { SearchSection } from "@/components/sections/SearchSection";
import {
  Building2,
  // , Users, Bookmark
} from "lucide-react";
import { useIndustries } from "@/hooks/useUgc";

// Code splitting - lazy load heavy components
const BrandDiscoverSection = lazy(() =>
  import("./BrandDiscoverSection").then((mod) => ({
    default: mod.BrandDiscoverSection,
  })),
);

const tabs: TabOption[] = [
  { id: "brands", label: "Brands", icon: <Building2 className="w-5 h-5" /> },
  // { id: 'creators', label: 'Creators', icon: <Users className="w-5 h-5" /> },
  // { id: 'saved', label: 'Saved', icon: <Bookmark className="w-5 h-5" /> },
];

export function AgencyTabsClient() {
  const [activeTab, setActiveTab] = useState("brands");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<
    string | undefined
  >();
  const [isSearching, setIsSearching] = useState(false);

  const { data: industriesData } = useIndustries();
  const industries = industriesData?.industries || [];

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleIndustrySelect = (industry: string) => {
    // If industry is empty string, it means "All" was clicked
    setSelectedIndustry(industry === "" ? undefined : industry);
  };

  // Dynamic search headers based on active tab
  const getSearchHeaders = () => {
    switch (activeTab) {
      case "brands":
        return { header1: "Search", header2: "top brands" };
      case "creators":
        return {
          header1: "What type of creator",
          header2: "are you looking for?",
        };
      case "saved":
        return { header1: "Search your", header2: "saved items" };
      default:
        return { header1: "Search", header2: "top brands" };
    }
  };

  const searchHeaders = getSearchHeaders();

  return (
    <div className="w-full">
      <GlowTabs
        tabs={tabs}
        activeTabId={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "brands" && (
          <div>
            <SearchSection
              header1={searchHeaders.header1}
              header2={searchHeaders.header2}
              badges={industries.length > 0 ? industries : undefined}
              showBadges={true}
              onSearch={handleSearchChange}
              selectedBadge={selectedIndustry}
              onBadgeClick={handleIndustrySelect}
              badgeVariant="scroll"
              badgeLabel="Filter Industries"
              isLoading={isSearching}
            />
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-4 border-[#6a57e5] border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <BrandDiscoverSection
                searchQuery={searchQuery}
                industry={selectedIndustry}
                onLoading={setIsSearching}
              />
            </Suspense>
          </div>
        )}

        {activeTab === "creators" && (
          <div>
            <SearchSection
              header1={searchHeaders.header1}
              header2={searchHeaders.header2}
              showBadges={true}
              badges={["UGC", "Influencer", "Content Creator", "Videographer"]}
              onSearch={handleSearchChange}
              badgeVariant="scroll"
            />
            {/* Additional creators content will go here */}
          </div>
        )}

        {activeTab === "saved" && (
          <div>
            <SearchSection
              header1={searchHeaders.header1}
              header2={searchHeaders.header2}
              showBadges={false}
              onSearch={handleSearchChange}
            />
            {/* Additional saved content will go here */}
          </div>
        )}
      </div>
    </div>
  );
}
